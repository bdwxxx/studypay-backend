import TelegramBot from 'node-telegram-bot-api';
import User from './models/user.model';
import jwt from 'jsonwebtoken';
import TelegramModel from './models/telegram.model';

export const setupBotHandlers = (bot: TelegramBot) => {
  bot.onText(/\/start/, async (msg: any) => {
    const text = '*Привет\\!* Я бот _StudyPay_, чем могу быть полезен?';
    bot.sendMessage(msg.chat.id, text, { parse_mode: 'MarkdownV2' });

    const chatId = msg.chat.id;
    const telegramUsername = msg.from?.username;

    if (telegramUsername) {
      try {
        // Сохранение chatId и telegramUsername в базе данных
        let telegramUser = await TelegramModel.findOne({ telegram: telegramUsername }).exec();
        if (!telegramUser) {
          telegramUser = new TelegramModel({
            telegram: telegramUsername,
            chatId: chatId,
          });
        } else {
          telegramUser.chatId = chatId; // Обновление chatId, если пользователь уже существует
        }
        await telegramUser.save();
        console.log(`Успешно сохранен пользователь: @${telegramUsername} с chatId: ${chatId}`);
      } catch (err) {
        console.log('Ошибка сохранения пользователь в боте:', err);
      }
    }
  });

  bot.onText(/\/resetpassword/, async (msg: any) => {
    const chatId = msg.chat.id;
    const telegramUsername = msg.from?.username;

    if (!telegramUsername) {
      const text = 'Не удалось определить ваш *username*. Попробуйте еще раз.';
      return bot.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
    }

    try {
      const user = await User.findOne({ telegram: telegramUsername });

      if (!user) {
        const text = 'Пользователь с таким *telegram* не найден.';
        return bot.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
      }

      const resetToken = jwt.sign({ id: user._id }, 'process.env.JWT' as string, {
        expiresIn: '10m',
      });

      const resetLink = `http://localhost:3000/resetpassword/${resetToken}`;
      const text = `Для сброса пароля перейдите по ссылке: [ссылка](${resetLink})\nСсылка действительна *10 минут*`;

      bot.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
    } catch {
      const text = 'Что\\-то пошло не так. Попробуйте позже.';
      bot.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
    }
  });
};
