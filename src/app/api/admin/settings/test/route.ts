import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb } from "@/../firebase/admin";

export async function POST(req: Request) {
  try {
    const { type, target } = await req.json();

    // 1. Get current settings (Firestore first, then .env)
    const settingsDoc = await adminDb.collection("settings").doc("system_config").get();
    const dbData = settingsDoc.exists ? settingsDoc.data() : {};
    
    const config = {
      smtpHost: dbData?.smtpHost || process.env.SMTP_HOST,
      smtpPort: parseInt(dbData?.smtpPort || process.env.SMTP_PORT || "465"),
      smtpUser: dbData?.smtpUser || process.env.SMTP_USER,
      smtpPass: dbData?.smtpPass || process.env.SMTP_PASS,
      smtpFromName: dbData?.smtpFromName || process.env.SMTP_FROM_NAME || "ClientZone",
      telegramToken: dbData?.telegramToken || process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: dbData?.telegramChatId || process.env.TELEGRAM_CHAT_ID,
    };

    if (type === "EMAIL") {
      if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
        return NextResponse.json({ error: "SMTP Configuration is incomplete" }, { status: 400 });
      }

      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${config.smtpFromName}" <${config.smtpUser}>`,
        to: target || config.smtpUser,
        subject: "ClientZone - Test Email Connection",
        html: `
          <h1>SMTP Connection Test Successful!</h1>
          <p>This email was sent to verify your SMTP settings in ClientZone.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        `,
      });

      return NextResponse.json({ success: true, message: "Test email sent successfully!" });
    }

    if (type === "TELEGRAM") {
      if (!config.telegramToken || !config.telegramChatId) {
        return NextResponse.json({ error: "Telegram Configuration is incomplete" }, { status: 400 });
      }

      const url = `https://api.telegram.org/bot${config.telegramToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: target || config.telegramChatId,
          text: `<b>🚀 Telegram Test Successful!</b>\n\nYour bot is correctly configured in ClientZone.\nTime: ${new Date().toLocaleString()}`,
          parse_mode: "HTML",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.description || "Telegram API Error");
      }

      return NextResponse.json({ success: true, message: "Test message sent successfully!" });
    }

    return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
  } catch (error: any) {
    console.error("Test Settings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
