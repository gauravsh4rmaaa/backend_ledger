import { accountModel } from "../models/account.model.js";

export const createAccountController = async (req, res) => {
  const decoded = req.user;

  const account = await accountModel.create({
    user: decoded._id,
  });

  return res.status(201).json({
    account,
  });
};
