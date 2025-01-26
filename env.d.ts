declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB: string;
    JWT: string;
    TELEGRAM_TOKEN: string;
    PORT: string;
    APIAIKEY: string;
    JWT_EXPIRES_IN: string;
  }
}
