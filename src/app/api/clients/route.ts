import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("users").where("role", "==", "CLIENT").orderBy("createdAt", "desc").get();
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
