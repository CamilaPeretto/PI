import nodemailer from 'nodemailer';
import { env, assertEmailConfig } from '../config/env.js';

let transporter;

export function getTransporter() {
  if (!transporter) {
    assertEmailConfig();
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Boolean(env.SMTP_SECURE),
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    });
  }
  return transporter;
}

export async function sendMail(options) {
  const t = getTransporter();
  return t.sendMail({ from: env.SMTP_FROM || env.SMTP_USER, ...options });
}


