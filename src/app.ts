import express from "express";
import cors from "cors";
import { AppError } from "./utils/AppError";
import { globalErrorHandler } from "./controllers";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();

//?------------------CORS OPTIONS------------------?\\
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://studypay-frontend.vercel.app",
    "https://studypay-one.vercel.app",
  ],
  methods: ["GET", "POST", "PUT"],
};

//?------------------MIDDLEWARES------------------?\\
app.use(express.json());
app.use(cors(corsOptions));

//?------------------ROUTES------------------?\\
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);

//?------------------HANDLE UNDEFINED ROUTES------------------?\\
app.all("*", (req, _res, next) => {
  const errorMessage = `Ooops... Can't find ${req.originalUrl} on this server`;
  const errorStatusCode = 404;

  next(new AppError(errorMessage, errorStatusCode));
});

//?------------------GLOBAL ERROR HANDLER------------------?\\
app.use(globalErrorHandler);

export { app };
