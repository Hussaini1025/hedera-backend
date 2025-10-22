import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client, Hbar, FileCreateTransaction, FileAppendTransaction, AccountBalanceQuery } from "@hashgraph/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Hedera client
const client = Client.forName(process.env.HEDERA_NETWORK);
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Hedera Certificate Backend Running ✅");
});

// ✅ Check balance route
app.get("/balance", async (req, res) => {
  try {
    const balance = await new AccountBalanceQuery()
      .setAccountId(process.env.HEDERA_ACCOUNT_ID)
      .execute(client);

    res.json({
      accountId: process.env.HEDERA_ACCOUNT_ID,
      balance: balance.hbars.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Upload certificate route
app.post("/upload-certificate", async (req, res) => {
  try {
    const { certificateData, studentName, course, dateIssued } = req.body;

    if (!certificateData) {
      return res.status(400).json({ error: "Certificate data is required" });
    }

    // Step 1: Create a file on Hedera
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([client.operatorPublicKey])
      .setContents("Certificate file created")
      .setMaxTransactionFee(new Hbar(2));
    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const fileId = fileCreateRx.fileId.toString();

    // Step 2: Append actual certificate data
    const appendTx = new FileAppendTransaction()
      .setFileId(fileId)
      .setContents(JSON.stringify({ certificateData, studentName, course, dateIssued }))
      .setMaxTransactionFee(new Hbar(2));
    await appendTx.execute(client);

    res.json({
      message: "Certificate uploaded successfully ✅",
      fileId,
      studentName,
      course,
      dateIssued,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));