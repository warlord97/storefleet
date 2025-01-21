import "./config/env.js";
import express from "express";
import swagger from "swagger-ui-express";
import fs from "fs";
import path from "path";

import connectDB from "./config/db.js";
import userRouter from "./src/routes/user.route.js";
import productRouter from "./src/routes/product.route.js";
import orderRouter from "./src/routes/order.route.js";
// import apiDocs from "./swagger.json" assert { type: "json" };

connectDB();

const app = express();
app.use(express.json());

//routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order/", orderRouter);

const apiDocs = JSON.parse(
  fs.readFileSync(path.resolve("swagger.json"), "utf-8")
);
app.use("/", swagger.serve, swagger.setup(apiDocs));

const port = process.env.PORT || 5100;
app.listen(port, () => {
  console.log("server started on port: ", port);
});
