import { accountModel } from "../models/account.model.js";

export const getBalance = async (req, res) => {
  const userId = req.user;

  const account = await accountModel.findOne({ user: userId });

  const balance = await account.getBalance();

  res.status(200).json({
    message: "balance fetched succecfully",
    balance,
  });
};
