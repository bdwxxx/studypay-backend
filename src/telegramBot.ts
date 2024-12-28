import TelegramBot from "node-telegram-bot-api";
import User from "./models/user.model";
import jwt from "jsonwebtoken";

export const setupBotHandlers = (bot: TelegramBot) => {
  bot.onText(/\/start/, (msg: any) => {
    const text = "*Привет\\!* Я бот _StudyPay_, чем могу быть полезен?";
    bot.sendMessage(msg.chat.id, text, { parse_mode: "MarkdownV2" });
    console.log("Bot received a message:", msg.text, "from", msg.chat.id, msg.from.username);
  });

  bot.onText(/\/resetpassword/, async (msg: any) => {
    const chatId = msg.chat.id;
    const telegramUsername = msg.from?.username;

    if (!telegramUsername) {
      const text = "Не удалось определить ваш *username*. Попробуйте еще раз.";
      return bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" });
    }

    try {
      const user = await User.findOne({ telegram: telegramUsername });

      if (!user) {
        const text = "Пользователь с таким *telegram* не найден.";
        return bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" });
      }

      const resetToken = jwt.sign(
        { id: user._id },
        "process.env.JWT" as string,
        { expiresIn: "10m" }
      );

      const resetLink = `http://localhost:3000/resetpassword/${resetToken}`;

      if (!resetLink) {
        const text =
          "Не удалось создать ссылку для сброса пароля\\. Попробуйте позже\\.";
        return bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" });
      }

      const escapedLink = resetLink.replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1"); 

    //! const text = `Для сброса пароля перейдите по ссылке: [ссылка](${escapedLink})\nСсылка действительна *10 минут*`; !\\ НЕ ЗАБЫТЬ СНЯТЬ КОММЕНТАРИЙ

    const text = `Для сброса пароля перейдите по ссылке: ${escapedLink}\nСсылка действительна *10 минут*`;

      bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" });
    } catch (err) {
      const text = "Что\\-то пошло не так. Попробуйте позже.";
      bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" });
    }
  });
};
