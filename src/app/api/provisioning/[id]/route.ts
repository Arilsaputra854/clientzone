import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { deployedUrl, status, cloudflareZoneId } = body;

    const orderRef = adminDb.collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update Order with deployment URL and mark as ACTIVE
    await orderRef.update({
      status: status || "ACTIVE",
      activatedAt: new Date(),
      cloudflareZoneId: cloudflareZoneId || null,
      serverCredentials: {
        deployedUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Provisioning API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
