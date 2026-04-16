import express from "express";
import cors from "cors";
import Router from "./api/api_gateway";

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.set('trust proxy', 1);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/api/v1", Router);

export default app;

