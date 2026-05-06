import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";
import { createXenditInvoice } from "@/lib/xendit";
import { sendTelegramNotification } from "@/lib/telegram";
import { sendEmail } from "@/lib/mail";
import { getInvoiceEmailTemplate } from "@/lib/email-templates";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    if (id) {
      const doc = await adminDb.collection("orders").doc(id).get();
      if (!doc.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      const data = doc.data()!;
      return NextResponse.json({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
        paidAt: data.paidAt?.toDate ? data.paidAt.toDate() : data.paidAt,
        activatedAt: data.activatedAt?.toDate ? data.activatedAt.toDate() : data.activatedAt,
      });
    }

    let query: any = adminDb.collection("orders");

    if (userId) {
      query = query.where("userId", "==", userId);
    }
    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    
    // Fetch all user names to populate missing ones (legacy data)
    const orders = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const data = doc.data();
      
      if (!data.userName && data.userId) {
        const userDoc = await adminDb.collection("users").doc(data.userId).get();
        if (userDoc.exists) {
          data.userName = userDoc.data()?.name;
          data.userEmail = userDoc.data()?.email;
        }
      }

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
        paidAt: data.paidAt?.toDate ? data.paidAt.toDate() : data.paidAt,
        activatedAt: data.activatedAt?.toDate ? data.activatedAt.toDate() : data.activatedAt,
      };
    }));

    // Sort in memory to avoid requiring composite index
    orders.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, productId, userId, userName, userEmail, domainName, repoUrl, customPrice, whoisData } = body;

    let product: any = {};
    let finalPrice = 0;
    let productName = "";
    let billingCycle = "ANNUAL";

    if (type === "DOMAIN") {
      finalPrice = customPrice;
      productName = `Domain: ${domainName}`;
      product = { name: productName, price: finalPrice, billingCycle: "ANNUAL" };
    } else {
      // 1. Get Product Data
      const productDoc = await adminDb.collection("products").doc(productId).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      product = productDoc.data()!;
      finalPrice = product.price;
      productName = product.name;
      billingCycle = product.billingCycle;
    }

    // 2. Create Order in Firestore
    const orderRef = adminDb.collection("orders").doc();
    const orderData = {
      id: orderRef.id,
      type: type || "HOSTING",
      userId,
      userName,
      userEmail,
      productId: productId || "custom_domain",
      productName,
      domainName,
      repoUrl: repoUrl || null,
      price: finalPrice,
      billingCycle,
      status: "UNPAID",
      whoisData: whoisData || null,
      createdAt: new Date(),
    };
    await orderRef.set(orderData);

    // 3. Create Xendit Invoice
    const xenditInvoice = await createXenditInvoice(
      orderRef.id,
      finalPrice,
      { email: userEmail, name: userName },
      `Pembayaran ${productName}`
    );

    // 4. Create Invoice Record in Firestore
    const invoiceRef = adminDb.collection("invoices").doc();
    await invoiceRef.set({
      id: invoiceRef.id,
      orderId: orderRef.id,
      userId,
      userName,
      userEmail,
      xenditInvoiceId: xenditInvoice.id,
      xenditInvoiceUrl: xenditInvoice.invoiceUrl,
      totalAmount: product.price,
      status: "PENDING",
      createdAt: new Date(),
      expiresAt: new Date(xenditInvoice.expiryDate),
    });

    // 4.5 Fetch Settings for Email Template
    const settingsDoc = await adminDb.collection("settings").doc("system_config").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : { companyName: "ClientZone", companyAddress: "", companyLogo: "" };

    // 5. Send Notifications
    if (type === "DOMAIN") {
      // Telegram to Admin
      await sendTelegramNotification(
        `🔔 <b>Pesanan Domain Baru</b>\n\n` +
        `📦 <b>Domain:</b> ${domainName}\n` +
        `👤 <b>Customer:</b> ${userName}\n` +
        `📧 <b>Email:</b> ${userEmail}\n` +
        `💰 <b>Total:</b> Rp ${finalPrice.toLocaleString("id-ID")}\n\n` +
        `Harap cek dashboard admin untuk data WHOIS.`
      );

      // Email to User
      await sendEmail({
        to: userEmail,
        subject: `[REMINDER] Invoice ${domainName}`,
        html: getInvoiceEmailTemplate(orderData, {
          id: invoiceRef.id,
          externalId: (xenditInvoice.id || "").substring(0, 8).toUpperCase(),
          status: "PENDING",
          totalAmount: finalPrice,
          expiresAt: xenditInvoice.expiryDate || new Date().toISOString(),
          xenditInvoiceUrl: xenditInvoice.invoiceUrl
        }, settings)
      });
    } else {
       // Standard notification for hosting orders
       await sendTelegramNotification(
        `🚀 <b>Order Layanan Baru</b>\n\n` +
        `📦 <b>Produk:</b> ${productName}\n` +
        `👤 <b>Customer:</b> ${userName}\n` +
        `💰 <b>Total:</b> Rp ${finalPrice.toLocaleString("id-ID")}`
      );

      // Email to User for Hosting
      await sendEmail({
        to: userEmail,
        subject: `[REMINDER] Invoice ${productName}`,
        html: getInvoiceEmailTemplate(orderData, {
          id: invoiceRef.id,
          externalId: (xenditInvoice.id || "").substring(0, 8).toUpperCase(),
          status: "PENDING",
          totalAmount: finalPrice,
          expiresAt: xenditInvoice.expiryDate || new Date().toISOString(),
          xenditInvoiceUrl: xenditInvoice.invoiceUrl
        }, settings)
      });
    }

    return NextResponse.json({ 
      orderId: orderRef.id, 
      paymentUrl: xenditInvoice.invoiceUrl 
    });
  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
