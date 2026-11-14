import express from "express";
import authRoute from "./routes/auth.route.js";
import accountsRoute from "./routes/accounts.route.js";
import transactionRoute from "./routes/transation.route.js";
import getRoute from "./routes/get.route.js";
import cookieParser from "cookie-parser";

// instance
const app = express();

//middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRoute);
app.use("/api/accounts", accountsRoute);
app.use("/api/transactions", transactionRoute);
app.use("/get", getRoute);

// export
export default app;
