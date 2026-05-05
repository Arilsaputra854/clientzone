import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("users").where("role", "==", "CLIENT").orderBy("createdAt", "desc").get();
    
    const clients = snapshot.docs.map(doc => {
      const data = doc.data();
      // Konversi Timestamp ke ISO string agar aman dikirim via JSON
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
      };
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    console.error("GET Clients API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
