import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });

    const otpDoc = await adminDb.collection("temp_otps").doc(email).get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: "OTP tidak ditemukan. Silakan kirim ulang." }, { status: 404 });
    }

    const data = otpDoc.data()!;
    const now = new Date();
    const expiresAt = data.expiresAt.toDate();

    if (now > expiresAt) {
      return NextResponse.json({ error: "OTP sudah kadaluarsa. Silakan kirim ulang." }, { status: 400 });
    }

    if (data.otp !== otp) {
      return NextResponse.json({ error: "Kode OTP salah." }, { status: 400 });
    }

    // Valid OTP - Clean up
    await adminDb.collection("temp_otps").doc(email).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
