import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function POST(req: Request) {
  try {
    const targetUrl = "https://www.domainesia.com/harga-domain/";
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) throw new Error("Gagal mengambil data dari registrar");

    const html = await response.text();
    
    const prices: Record<string, number> = {};
    
    // Match each domain row/block
    // Look for TLD in link: <a ...>.tld</a>
    // Then look for Rp values following it
    const domainBlocks = html.split(/<a[^>]+class="[^"]*font-semibold[^"]*"[^>]*>\.([a-z.]+)/g);
    
    // The split will give: [garbage, tld1, content_after_tld1, tld2, content_after_tld2, ...]
    for (let i = 1; i < domainBlocks.length; i += 2) {
      const tld = "." + domainBlocks[i];
      const afterTldHtml = domainBlocks[i + 1].substring(0, 2000); // Look at next 2000 chars
      
      // Match all Rp values in this block
      const priceMatches = afterTldHtml.match(/Rp\s*([0-9.]+)/g);
      
      if (priceMatches && priceMatches.length >= 2) {
        // Renewal price is usually the 2nd or 3rd Rp value in DomaiNesia's new layout
        // (Daftar has two prices: strike-through and promo, then Perpanjang)
        // If there's a strike-through, Perpanjang is the 3rd.
        // If no strike-through, it's the 2nd.
        // We'll take the highest price found in the first 3 matches, as renewal is usually the non-promo price.
        const numericPrices = priceMatches.slice(0, 3).map(p => parseInt(p.replace(/[^0-9]/g, "")));
        const renewalPrice = Math.max(...numericPrices);
        
        if (renewalPrice > 0) {
          prices[tld] = renewalPrice;
        }
      }
    }

    if (Object.keys(prices).length === 0) {
      throw new Error("Tidak ada data harga yang ditemukan. Struktur halaman mungkin berubah.");
    }

    // Save to Firestore
    const settingsRef = adminDb.collection("settings").doc("domain_prices");
    await settingsRef.set({
      prices,
      lastSync: new Date(),
      source: "DomaiNesia"
    });

    return NextResponse.json({ 
      success: true, 
      count: Object.keys(prices).length,
      lastSync: new Date()
    });
  } catch (error: any) {
    console.error("Sync Domain Prices Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
