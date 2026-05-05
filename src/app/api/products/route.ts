import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("products").orderBy("createdAt", "desc").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, description, price, billingCycle } = body;

    const docRef = await adminDb.collection("products").add({
      name,
      category,
      description,
      price: parseFloat(price),
      billingCycle,
      isActive: true,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
