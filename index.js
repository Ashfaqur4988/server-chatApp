import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); //to parse req.body
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);

app.listen(8080, () => {
  console.log("server running on port 8080");
});

// TODO:add socket.io to the ag-charts-format-sub-level-group-container
// TODO: configure this server for the deployment
