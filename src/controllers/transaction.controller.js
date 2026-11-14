import { accountModel } from "../models/account.model.js";
import ledgerModel from "../models/ledger.model.js";
import { transactionModel } from "../models/transaction.model.js";
import mongoose from "mongoose";
import { sendDebitEmail, sendCreditEmail } from "../services/email.service.js";

export const transactioncontroller = async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencKey } = req.body;

  const user = req.user;

  // Validate user request
  if (
    !fromAccount ||
    !toAccount ||
    !amount ||
    !idempotencKey ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return res.status(400).json({
      message: "All fields are required and amount must be positive",
    });
  }

  const fromUserAccount = await accountModel
    .findById(fromAccount)
    .populate("user");

  const toUserAccount = await accountModel.findById(toAccount).populate("user");

  // Check account existence
  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({
      message: "From and To accounts do not exist",
    });
  }

  // Check account ownership
  if (
    !fromUserAccount.user ||
    user._id.toString() !== fromUserAccount.user._id.toString()
  ) {
    return res.status(403).json({
      message: "Unauthorized user",
    });
  }

  // Validate idempotency key
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  // Check account status
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message: "From and To accounts must be active",
    });
  }

  // Get sender balance
  const balance = await fromUserAccount.getBalance();
  console.log(balance);

  // Check sufficient balance
  // if (balance < amount) {
  //   return res.status(400).json({
  //     message: `Insufficient balance: ${balance}, but amount is ${amount}`,
  //   });
  // }

  // Create transaction session
  const session = await mongoose.startSession();

  let transaction;

  try {
    session.startTransaction();

    // Create transaction record
    [transaction] = await transactionModel.create(
      [{ fromAccount, toAccount, amount, idempotencKey }],
      { session },
    );

    // Debit ledger
    await ledgerModel.create(
      [
        {
          transaction: transaction._id,
          amount,
          type: "DEBIT",
          account: fromAccount,
        },
      ],
      { session },
    );

    // Credit ledger
    await ledgerModel.create(
      [
        {
          transaction: transaction._id,
          amount,
          account: toAccount,
          type: "CREDIT",
        },
      ],
      { session },
    );

    // Update transaction status
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // Sending emails related to transaction
  const senderEmail = fromUserAccount.user.email;
  const receiverEmail = toUserAccount.user.email;

  await sendDebitEmail(senderEmail, transaction);
  await sendCreditEmail(receiverEmail, transaction);

  return res.status(200).json({
    message: "Transaction done successfully",
    transaction,
  });
};

export const createInitialFundsTransaction = async (req, res) => {
  const decoded = req.user;

  const { toAccount, amount, idempotencKey } = req.body;

  if (!toAccount || !amount || !idempotencKey) {
    return res.status(422).json({
      message: "missing field",
    });
  }

  const systemAccount = await accountModel.findOne({ user: decoded._id });
  console.log(systemAccount);

  const session = await mongoose.startSession();
  let transaction;
  try {
    session.startTransaction();

    // Create transaction record
    [transaction] = await transactionModel.create(
      [
        {
          fromAccount: systemAccount._id,
          toAccount,
          amount,
          idempotencKey,
        },
      ],
      { session },
    );

    // Debit ledger
    await ledgerModel.create(
      [
        {
          transaction: transaction._id,
          amount,
          type: "DEBIT",
          account: systemAccount._id,
        },
      ],
      { session },
    );

    // Credit ledger
    await ledgerModel.create(
      [
        {
          transaction: transaction._id,
          amount,
          account: toAccount,
          type: "CREDIT",
        },
      ],
      { session },
    );

    // Update transaction status
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  return res.status(201).json({
    message: "initial fund added succecfulyy",
    transaction,
  });
};
