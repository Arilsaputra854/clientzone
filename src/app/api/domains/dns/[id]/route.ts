import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

const CF_API_URL = "https://api.cloudflare.com/client/v4";

async function getCFHeaders() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN is not configured in .env");
  
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderDoc = await adminDb.collection("orders").doc(id).get();
    if (!orderDoc.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    
    const zoneId = orderDoc.data()?.cloudflareZoneId;
    if (!zoneId) return NextResponse.json({ error: "DNS Management belum diaktifkan oleh admin." }, { status: 400 });

    const res = await fetch(`${CF_API_URL}/zones/${zoneId}/dns_records?per_page=100`, {
      headers: await getCFHeaders()
    });
    const data = await res.json();
    
    if (!data.success) throw new Error(data.errors?.[0]?.message || "Gagal mengambil data DNS");
    
    return NextResponse.json(data.result);
  } catch (error: any) {
    console.error("CF GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, name, content, ttl, proxied } = body;

    const orderDoc = await adminDb.collection("orders").doc(id).get();
    const zoneId = orderDoc.data()?.cloudflareZoneId;
    if (!zoneId) return NextResponse.json({ error: "Zone ID not found" }, { status: 400 });

    const res = await fetch(`${CF_API_URL}/zones/${zoneId}/dns_records`, {
      method: "POST",
      headers: await getCFHeaders(),
      body: JSON.stringify({ type, name, content, ttl: ttl || 1, proxied: proxied || false })
    });
    const data = await res.json();
    
    if (!data.success) throw new Error(data.errors?.[0]?.message || "Gagal menambah record DNS");
    
    return NextResponse.json(data.result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) return NextResponse.json({ error: "Record ID required" }, { status: 400 });

    const orderDoc = await adminDb.collection("orders").doc(id).get();
    const zoneId = orderDoc.data()?.cloudflareZoneId;
    if (!zoneId) return NextResponse.json({ error: "Zone ID not found" }, { status: 400 });

    const res = await fetch(`${CF_API_URL}/zones/${zoneId}/dns_records/${recordId}`, {
      method: "DELETE",
      headers: await getCFHeaders()
    });
    const data = await res.json();
    
    if (!data.success) throw new Error(data.errors?.[0]?.message || "Gagal menghapus record DNS");
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
