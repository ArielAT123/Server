import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import morgan from "morgan"
import { initSocketServer } from "./utils/index.js";
import { authRoutes, userRouters, chatRoutes, chatMessageRoutes, groupRoutes, groupMessageRoutes } from "./routes/index.js";


const app = express();
const server = http.createServer(app);
initSocketServer(server);

// Configure Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Configure static folder
app.use(express.static("uploads"));

// Configure Headers
app.use(cors());

// Configure logger
app.use(morgan("dev"));

// Configure routings
app.use("/api", authRoutes);
app.use("/api", userRouters);
app.use("/api", chatRoutes);
app.use("/api", chatMessageRoutes);
app.use("/api", groupRoutes);
app.use("/api", groupMessageRoutes);



export { server };
