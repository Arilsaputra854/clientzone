import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const doc = await adminDb.collection("products").doc(params.id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await adminDb.collection("products").doc(params.id).update({
      ...body,
      price: body.price ? parseFloat(body.price) : undefined,
      updatedAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await adminDb.collection("products").doc(params.id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
