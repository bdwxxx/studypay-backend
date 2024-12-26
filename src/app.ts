import express from "express";
import cors from "cors";
import { AppError } from "./utils/AppError";
import { globalErrorHandler } from "./controllers";


const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://studypay-frontend.vercel.app",
    "https://studypay-one.vercel.app",
  ],
  methods: ["GET", "POST", "PUT"],
};

app.use(express.json());
app.use(cors(corsOptions));

app.all("*", (req, _res, next) => {
  const errorMessage = `Ooops... Can't find ${req.originalUrl} on this server❗`;
  const errorStatusCode = 404;

  next(new AppError(errorMessage, errorStatusCode));
});

app.get("/", (_req, res) => {
    res.send("Hello from express");
});

app.use(globalErrorHandler);


export { app };
