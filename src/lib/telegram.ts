import { adminDb } from "@/../firebase/admin";

/**
 * Utility to send notifications to Admin via Telegram
 */
export async function sendTelegramNotification(message: string) {
  try {
    // 1. Get current settings
    const settingsDoc = await adminDb.collection("settings").doc("system_config").get();
    const dbData = settingsDoc.exists ? settingsDoc.data() : {};

    const token = dbData?.telegramToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = dbData?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram configuration missing. Notification skipped.");
      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Telegram API Error:", error);
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}
