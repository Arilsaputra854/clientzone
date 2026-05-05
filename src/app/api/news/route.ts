import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    let query: any = adminDb.collection("news");
    
    if (activeOnly) {
      query = query.where("isActive", "==", true);
    }

    const snapshot = await query.get();
    const news = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
    }));

    // Sort in memory to avoid requiring composite index
    news.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, type, isActive } = body;

    const newsRef = adminDb.collection("news").doc();
    await newsRef.set({
      title,
      content,
      type: type || "INFO", // INFO, MAINTENANCE, ALERT
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: newsRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await adminDb.collection("news").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
