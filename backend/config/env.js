import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '5000',
  DB_USER: required('DB_USER'),
  DB_PASS: required('DB_PASS'),
  DB_NAME: required('DB_NAME'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM
};

export function assertEmailConfig() {
  const requiredFields = ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS'];
  for (const f of requiredFields) {
    if (!process.env[f]) throw new Error(`Config SMTP incompleta: ${f}`);
  }
}


