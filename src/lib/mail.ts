import nodemailer from "nodemailer";
import { adminDb } from "@/../firebase/admin";

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    // 1. Fetch dynamic settings from Firestore
    const settingsDoc = await adminDb.collection("settings").doc("system_config").get();
    const dbData = settingsDoc.exists ? settingsDoc.data() : {};

    // 2. Build configuration with fallbacks
    const config = {
      host: dbData?.smtpHost || process.env.SMTP_HOST,
      port: parseInt(dbData?.smtpPort || process.env.SMTP_PORT || "465"),
      user: dbData?.smtpUser || process.env.SMTP_USER,
      pass: dbData?.smtpPass || process.env.SMTP_PASS,
      fromName: dbData?.smtpFromName || process.env.SMTP_FROM_NAME || "ClientZone",
    };

    if (!config.host || !config.user || !config.pass) {
      throw new Error("SMTP Configuration missing (both in DB and ENV)");
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.user}>`,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Send Email Error:", error);
    return { success: false, error: error.message };
  }
}
