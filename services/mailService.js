import '../config/env.js'
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASS,
  },
});

export const sendMail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL,
      to,
      subject,
      text,
    });
    return info;
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};
