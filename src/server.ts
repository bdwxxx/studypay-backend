import * as dotenv from "dotenv";
import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { app } from "./app";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

//?---------INITIALIZE MONGODB---------?\\
const initializeMongoDB = async () => {
  const dbURL = process.env["MONGODB"];
  if (!dbURL) {
    console.error("MongoDB URL is not provided ❗");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbURL);
    console.log("MongoDB connected ✔");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

//?--------INITIALIZE TELEGRAM BOT--------?\\
const initializeTelegramBot = () => {
  const token = process.env["TELEGRAMTOKEN"];
  if (!token) {
    console.error("Telegram token is not provided ❗");
    process.exit(1);
  }

  const bot = new TelegramBot(token, { polling: true });

  bot.on("polling_start", () => {
    console.log("Bot started polling");
  });

  bot.on("polling_error", (error: unknown) => {
    console.error("Polling error:", error);
  });

  bot.on("message", (msg) => {
    console.log("Bot received a message:", msg.text);
  });

  bot.getMe().then((botInfo) => {
    console.log(`Telegram bot @${botInfo.username} started ✔ `);
  });

  return bot;
};

const bot = initializeTelegramBot();
export { bot };

//?--------START SERVER--------?\\
const startServer = () => {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT} ✔`);
  });

  process.on("unhandledRejection", (error: unknown) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    if (error instanceof Error) {
      console.log(error.name, error.message);
    }
    server.close(() => {
      process.exit(1);
    });
  });
};

//?---------START APP---------?\\
const startApp = async () => {
  await initializeMongoDB();
  startServer();
};

startApp();
