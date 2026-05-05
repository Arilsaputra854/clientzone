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
    const invoices = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt,
        paidAt: data.paidAt?.toDate ? data.paidAt.toDate() : data.paidAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      };
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("GET Invoices API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
