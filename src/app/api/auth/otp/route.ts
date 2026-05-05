import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in Firestore
    await adminDb.collection("temp_otps").doc(email).set({
      otp,
      expiresAt,
      createdAt: new Date(),
    });

    // Send Email
    const emailRes = await sendEmail({
      to: email,
      subject: "Kode OTP Registrasi ClientZone",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f4f4f4;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1a73e8; margin-top: 0;">Verifikasi Akun Anda</h2>
            <p style="color: #555;">Gunakan kode OTP berikut untuk menyelesaikan proses registrasi di ClientZone:</p>
            <div style="background: #f0f7ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8; border-radius: 8px; margin: 30px 0;">
              ${otp}
            </div>
            <p style="color: #888; font-size: 12px;">Kode ini akan kadaluarsa dalam 5 menit. Jika Anda tidak merasa melakukan registrasi, abaikan email ini.</p>
          </div>
        </div>
      `,
    });

    if (!emailRes.success) {
      throw new Error(emailRes.error || "Gagal mengirim email OTP");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("OTP API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
