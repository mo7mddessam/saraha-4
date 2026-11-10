import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const sendEmail = async ({ to, subject, html }) => {
  if (!env.email || !env.emailPass) {
    // dev mode: no SMTP configured
    console.log(`📧 [DEV EMAIL] to=${to} | ${subject}\n${html.replace(/<[^>]+>/g, " ")}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.email, pass: env.emailPass },
  });
  await transporter.sendMail({ from: `"Saraha App" <${env.email}>`, to, subject, html });
};
