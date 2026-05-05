import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) return NextResponse.json({ error: "ticketId is required" }, { status: 400 });

    const snapshot = await adminDb.collection("ticket_messages")
      .where("ticketId", "==", ticketId)
      .get();

    const messages = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
    }));

    // Sort in memory to avoid requiring composite index
    messages.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, senderId, senderName, senderRole, content } = body;

    const messageData = {
      ticketId,
      senderId,
      senderName,
      senderRole,
      content,
      createdAt: new Date(),
    };

    await adminDb.collection("ticket_messages").add(messageData);

    // Update ticket's updatedAt and status
    const statusUpdate = senderRole === "admin" ? "WAITING_CLIENT" : "WAITING_ADMIN";
    await adminDb.collection("tickets").doc(ticketId).update({
      updatedAt: new Date(),
      status: statusUpdate,
      lastMessage: content,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
