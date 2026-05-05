import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    if (id) {
      const doc = await adminDb.collection("tickets").doc(id).get();
      if (!doc.exists) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      const data = doc.data()!;
      return NextResponse.json({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      });
    }

    let query: any = adminDb.collection("tickets");
    if (userId) {
      query = query.where("userId", "==", userId);
    }

    const snapshot = await query.get();
    const tickets = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
    }));

    // Sort in memory to avoid requiring composite index
    tickets.sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userName, subject, category, message, priority } = body;

    const ticketRef = adminDb.collection("tickets").doc();
    const ticketId = ticketRef.id;

    const ticketData = {
      userId,
      userName,
      subject,
      category: category || "Technical",
      status: "OPEN",
      priority: priority || "MEDIUM",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: message,
    };

    await ticketRef.set(ticketData);

    // Add first message
    await adminDb.collection("ticket_messages").add({
      ticketId,
      senderId: userId,
      senderName: userName,
      senderRole: "client",
      content: message,
      createdAt: new Date(),
    });

    // Notify Admin via Telegram
    try {
      const { sendTelegramNotification } = await import("@/lib/telegram");
      await sendTelegramNotification(
        `<b>🆕 Tiket Baru</b>\n\n` +
        `<b>Subjek:</b> ${subject}\n` +
        `<b>Klien:</b> ${userName}\n` +
        `<b>Kategori:</b> ${category}\n` +
        `<b>Prioritas:</b> ${priority}\n\n` +
        `<i>Silakan cek panel admin untuk membalas.</i>`
      );
    } catch (e) {
      console.error("Telegram notify failed", e);
    }

    return NextResponse.json({ id: ticketId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const body = await req.json();
    const { status } = body;

    await adminDb.collection("tickets").doc(id).update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
