import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";
import { sendEmail } from "@/lib/mail";
import { getInvoiceEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = req.headers;
    const xenditToken = headers.get("x-callback-token");

    // 1. Verify Webhook Token
    if (process.env.XENDIT_WEBHOOK_TOKEN && xenditToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Invalid callback token" }, { status: 401 });
    }

    // Xendit Invoice Callback usually contains 'id', 'external_id', 'status', 'paid_at'
    const { external_id, status, paid_at } = body;

    if (status === "PAID") {
      // 2. Find Order and Invoice
      const orderId = external_id;
      const orderRef = adminDb.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        const orderData = orderDoc.data()!;
        
        // 3. Update Order Status
        const dueDate = new Date();
        if (orderData.billingCycle === "MONTHLY") {
          dueDate.setMonth(dueDate.getMonth() + 1);
        } else {
          dueDate.setFullYear(dueDate.getFullYear() + 1);
        }

        await orderRef.update({
          status: "ON_PROCESS",
          paidAt: new Date(paid_at),
          dueDate: dueDate,
          updatedAt: new Date(),
        });

        // 4. Update Invoice Status
        const invoicesSnapshot = await adminDb.collection("invoices")
          .where("orderId", "==", orderId)
          .where("status", "==", "PENDING")
          .get();
        
        if (!invoicesSnapshot.empty) {
          const invoiceRef = invoicesSnapshot.docs[0].ref;
          await invoiceRef.update({
            status: "PAID",
            paidAt: new Date(paid_at),
            updatedAt: new Date(),
          });
        }

        // Notify Admin via Telegram
        try {
          const { sendTelegramNotification } = await import("@/lib/telegram");
          const isDomain = orderData.type === "DOMAIN";
          await sendTelegramNotification(
            `<b>💰 Pembayaran Diterima!</b>\n\n` +
            `<b>Order:</b> ${isDomain ? "Pendaftaran Domain" : "Layanan Hosting"}\n` +
            `<b>Produk:</b> ${orderData.productName}\n` +
            `<b>Klien:</b> ${orderData.userName || orderData.userEmail}\n` +
            `<b>Domain:</b> ${orderData.domainName}\n` +
            `<b>Total:</b> Rp ${orderData.price?.toLocaleString("id-ID")}\n\n` +
            (isDomain 
              ? `<b>⚠️ DOMAIN REGISTRATION REQUIRED</b>\n<i>Segera daftarkan domain di registrar pilihan Anda.</i>`
              : `<b>⚠️ PROVISIONING REQUIRED</b>\n<i>Layanan siap di-setup di panel admin.</i>`)
          );

          // Notify User via Email
          const settingsDoc = await adminDb.collection("settings").doc("system_config").get();
          const settings = settingsDoc.exists ? settingsDoc.data() : { companyName: "ClientZone", companyAddress: "", companyLogo: "" };

          await sendEmail({
            to: orderData.userEmail,
            subject: `[CONFIRMATION] Pembayaran Invoice #${external_id.substring(0, 8).toUpperCase()}`,
            html: getInvoiceEmailTemplate(orderData, {
              id: external_id,
              status: "PAID",
              totalAmount: orderData.price,
              expiresAt: orderData.dueDate,
            }, settings)
          });
        } catch (e) {
          console.error("Notification failed", e);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Xendit Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
