import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { serverIp, serverUsername, serverPassword, controlPanelUrl, status } = body;

    const orderRef = adminDb.collection("orders").doc(id);
    
    await orderRef.update({
      status: status || "ACTIVE",
      serverCredentials: {
        serverIp,
        serverUsername,
        serverPassword,
        controlPanelUrl,
      },
      activatedAt: new Date(),
      updatedAt: new Date(),
    });

    // TODO: Send activation email to client here
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Provisioning API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
