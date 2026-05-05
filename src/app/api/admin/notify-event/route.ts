import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { event, data } = await req.json();

    let message = "";

    switch (event) {
      case "NEW_USER":
        message = `<b>👤 User Baru Terdaftar!</b>\n\n` +
                  `<b>Nama:</b> ${data.name}\n` +
                  `<b>Email:</b> ${data.email}\n` +
                  `<b>Waktu:</b> ${new Date().toLocaleString("id-ID")}\n\n` +
                  `<i>Selamat! Komunitas ClientZone bertambah.</i>`;
        break;
      
      default:
        return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }

    await sendTelegramNotification(message);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
