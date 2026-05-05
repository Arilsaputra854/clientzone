import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

const SETTINGS_DOC = "system_config";

export async function GET() {
  try {
    const doc = await adminDb.collection("settings").doc(SETTINGS_DOC).get();
    
    // Fallback values from process.env if Firestore is empty
    const defaultSettings = {
      smtpHost: process.env.SMTP_HOST || "",
      smtpPort: process.env.SMTP_PORT || "465",
      smtpUser: process.env.SMTP_USER || "",
      smtpPass: process.env.SMTP_PASS ? "********" : "", // Mask password
      smtpFromName: process.env.SMTP_FROM_NAME || "ClientZone",
      telegramToken: process.env.TELEGRAM_BOT_TOKEN || "",
      telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
    };

    if (!doc.exists) {
      return NextResponse.json(defaultSettings);
    }

    const data = doc.data()!;
    return NextResponse.json({
      ...defaultSettings,
      ...data,
      // Keep password masked if it exists in Firestore
      smtpPass: data.smtpPass ? "********" : defaultSettings.smtpPass
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFromName, telegramToken, telegramChatId } = body;

    const updateData: any = {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpFromName,
      telegramToken,
      telegramChatId,
      updatedAt: new Date(),
    };

    // Only update password if it's not the masked value
    if (smtpPass && smtpPass !== "********") {
      updateData.smtpPass = smtpPass;
    }

    await adminDb.collection("settings").doc(SETTINGS_DOC).set(updateData, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
