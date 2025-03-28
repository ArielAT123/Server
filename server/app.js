import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import morgan from "morgan";
import { initSocketServer } from "./utils/index.js";

import {
  authRoutes,
  userRouters,
  chatRoutes,
  chatMessageRoutes,
  groupRoutes,
  groupMessageRoutes,
  postRoutes,
  commentRoutes,
  likeRoutes,
  followRoutes,
  tagRoutes,
  notificationRoutes,
  orderRoutes,
  productRoutes,
  reportRoutes,
  eventRoutes,
  feedRoutes,
  StoryRoutes
} from "./routes/index.js";



const app = express();
const server = http.createServer(app);

// Inicializar servidor de sockets
initSocketServer(server);

// Middlewares generales
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("uploads"));

// Rutas agrupadas bajo /api
app.use("/api", authRoutes);
app.use("/api", userRouters);
app.use("/api", chatRoutes);
app.use("/api", chatMessageRoutes);
app.use("/api", groupRoutes);
app.use("/api", groupMessageRoutes);
app.use("/api", feedRoutes);
app.use("/api", StoryRoutes);
app.use("/api", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);
app.use("/api", followRoutes);
app.use("/api", tagRoutes);
app.use("/api", notificationRoutes);
app.use("/api", orderRoutes);
app.use("/api", productRoutes);
app.use("/api", reportRoutes);
app.use("/api", eventRoutes);
export { server };
