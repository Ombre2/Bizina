// src/config/configuration.ts

export default () => ({
  port: Number(process.env.PORT ?? 3000),

  database: {
    type: process.env.DATABASE_TYPE ?? 'mysql',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 3306),
    username: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASS ?? '',
    database: process.env.DATABASE_NAME ?? 'bizina',
    synchronize: false, // Ne pas synchroniser en prod
    logging: process.env.NODE_ENV !== 'production', // Active le logging en dev
  },

  jwt: {
    secret: (() => {
      if (!process.env.JWT_SECRET) {
        throw new Error(
          "JWT_SECRET est obligatoire. Définissez la variable d'environnement JWT_SECRET.",
        );
      }
      return process.env.JWT_SECRET;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: (() => {
      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error(
          "JWT_REFRESH_SECRET est obligatoire. Définissez la variable d'environnement JWT_REFRESH_SECRET.",
        );
      }
      return process.env.JWT_REFRESH_SECRET;
    })(),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
});
