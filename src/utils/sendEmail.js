import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isSecure =
      process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: isSecure, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `"${process.env.FROM_NAME || "Vasudha Foundation"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(
      `[Nodemailer] Email dispatched to ${options.email} | MessageId: ${info.messageId}`,
    );
    return info;
  } else {
    // Fallback if credentials are not in .env yet
    console.warn(
      "[Nodemailer Warning] SMTP_USER or SMTP_PASS not found in .env. Falling back to terminal output.",
    );
    console.log(`\n================== [EMAIL SIMULATOR] ==================`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.html.replace(/<[^>]*>?/gm, "")}`);
    console.log(`=======================================================\n`);
  }
};
