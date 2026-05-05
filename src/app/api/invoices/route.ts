import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    let query: any = adminDb.collection("invoices").orderBy("createdAt", "desc");

    if (userId) {
      query = query.where("userId", "==", userId);
    }
    if (orderId) {
      query = query.where("orderId", "==", orderId);
    }

    const snapshot = await query.get();
    const invoices = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
