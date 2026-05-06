import { format } from "date-fns";

export function getInvoiceEmailTemplate(order: any, invoice: any, settings: any) {
  const isPaid = invoice.status === "PAID";
  const statusColor = isPaid ? "#34a853" : "#ea4335";
  const logoHtml = settings.companyLogo 
    ? `<img src="${settings.companyLogo}" alt="${settings.companyName}" style="height: 50px; margin-bottom: 20px;">`
    : `<h1 style="color: #1a73e8; margin: 0; font-family: sans-serif;">${settings.companyName}</h1>`;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-top: 5px solid ${statusColor};">
      <div style="padding: 40px;">
        <div style="text-align: left;">
          ${logoHtml}
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">Dear <b>${order.userName}</b>,</p>
        
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          ${isPaid 
            ? `Terima kasih! Pembayaran untuk <b>Invoice #${invoice.externalId || invoice.id.substring(0, 8).toUpperCase()}</b> telah kami terima.`
            : `Kami ingatkan bahwa Anda memiliki tagihan <b>Invoice #${invoice.externalId || invoice.id.substring(0, 8).toUpperCase()}</b> yang akan jatuh tempo pada tanggal <b>${format(new Date(invoice.expiresAt), "dd/MM/yyyy")}</b>.`
          }
          Berikut informasi detailnya:
        </p>

        <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin: 30px 0;">
          <p style="margin: 0; color: #999; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Invoice Details</p>
          <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: bold;">#${invoice.externalId || invoice.id.substring(0, 8).toUpperCase()}</p>
          <p style="margin: 5px 0 0; color: #666; font-size: 12px;">Jatuh Tempo: ${format(new Date(invoice.expiresAt), "dd/MM/yyyy")}</p>
          
          <div style="margin-top: 20px; border-top: 1px solid #eee; pt: 15px;">
            <p style="margin: 15px 0 5px; color: #333; font-size: 14px; font-weight: bold;">${order.productName}</p>
            <p style="margin: 0; color: #888; font-size: 12px;">${order.domainName || ""}</p>
            ${order.billingCycle ? `<p style="margin: 5px 0 0; color: #aaa; font-size: 10px;">Billing Cycle: ${order.billingCycle}</p>` : ""}
          </div>
          
          <div style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 15px; display: flex; justify-content: space-between;">
             <span style="color: #444; font-weight: bold;">TOTAL</span>
             <span style="color: #1a73e8; font-size: 18px; font-weight: 900;">Rp ${invoice.totalAmount?.toLocaleString("id-ID")}</span>
          </div>
        </div>

        ${!isPaid ? `
        <div style="text-align: center; margin: 40px 0;">
          <a href="${invoice.xenditInvoiceUrl}" style="background: #1a73e8; color: white; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3);">Bayar Sekarang</a>
        </div>
        ` : ""}

        <p style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invoice/${invoice.id}" style="color: #1a73e8; font-size: 12px; text-decoration: none; font-weight: bold;">Detail invoice &raquo;</a>
        </p>

        <p style="color: #888; font-size: 12px; line-height: 1.6; font-style: italic; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          ${isPaid 
            ? "Layanan Anda sedang diproses oleh tim kami. Anda akan menerima notifikasi email kembali setelah layanan aktif."
            : "Untuk tagihan berlangganan, keterlambatan pembayaran dapat menyebabkan layanan Anda dihentikan/disuspend secara otomatis oleh sistem."
          }
        </p>
      </div>

      <div style="background: #f4f4f4; padding: 30px; text-align: center;">
        <p style="margin: 0; color: #333; font-weight: bold; font-size: 14px;">${settings.companyName}</p>
        <p style="margin: 5px 0 0; color: #888; font-size: 11px; line-height: 1.4;">${settings.companyAddress}</p>
        <div style="margin-top: 15px;">
           <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="color: #1a73e8; font-size: 11px; text-decoration: none;">Website</a> | 
           <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tickets" style="color: #1a73e8; font-size: 11px; text-decoration: none;">Technical Support</a>
        </div>
      </div>
    </div>
  `;
}
