import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    let query: any = adminDb.collection("invoices");

    if (userId) {
      query = query.where("userId", "==", userId);
    }
    if (orderId) {
      query = query.where("orderId", "==", orderId);
    }

    const snapshot = await query.get();
    
    // Fetch all user names to populate missing ones (legacy data)
    const invoices = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const data = doc.data();
      
      if (!data.userName && data.userId) {
        const userDoc = await adminDb.collection("users").doc(data.userId).get();
        if (userDoc.exists) {
          data.userName = userDoc.data()?.name;
          data.userEmail = userDoc.data()?.email;
        }
      }

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt,
        paidAt: data.paidAt?.toDate ? data.paidAt.toDate() : data.paidAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      };
    }));

    // Sort in memory to avoid requiring composite index
    invoices.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("GET Invoices API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
