import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

const FALLBACK_PRICES: Record<string, number> = {
  ".com": 165000,
  ".id": 225000,
  ".net": 185000,
  ".org": 195000,
  ".info": 160000,
  ".xyz": 55000,
  ".co.id": 275000,
  ".my.id": 25000,
  ".biz.id": 25000,
  ".web.id": 65000,
  ".online": 95000,
  ".tech": 125000,
};

const MARKUP = 1.15; // 15% markup

async function checkDomainAvailability(domain: string) {
  try {
    // Using RDAP (Registration Data Access Protocol) which is the modern WHOIS
    // We try to fetch domain info. If it returns 404, it might be available.
    // Note: Some registries might not support RDAP or have different response patterns.
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      method: 'GET',
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (response.status === 404) {
      return { available: true };
    }
    
    if (response.ok) {
      return { available: false };
    }

    // Fallback/Error case - assume not available to be safe or return error
    return { available: false, error: "Could not verify" };
  } catch (error) {
    console.error("RDAP Check Error:", error);
    return { available: false, error: "Service unavailable" };
  }
}

async function getBasePrices() {
  try {
    const doc = await adminDb.collection("settings").doc("domain_prices").get();
    if (doc.exists) {
      return doc.data()?.prices || FALLBACK_PRICES;
    }
  } catch (error) {
    console.error("Error fetching prices from DB:", error);
  }
  return FALLBACK_PRICES;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain")?.toLowerCase();

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const parts = domain.split(".");
  if (parts.length < 2) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  const tld = "." + parts.slice(1).join(".");
  const nameOnly = parts[0];

  const basePrices = await getBasePrices();
  const mainCheck = await checkDomainAvailability(domain);
  const basePrice = basePrices[tld] || 200000; // Default if TLD not found
  const markedUpPrice = Math.ceil(basePrice * MARKUP);

  // Get alternatives
  const altTlds = [".com", ".id", ".net", ".org", ".my.id", ".online", ".tech"].filter(t => t !== tld);
  const alternatives = await Promise.all(
    altTlds.slice(0, 4).map(async (altTld) => {
      const altDomain = `${nameOnly}${altTld}`;
      const check = await checkDomainAvailability(altDomain);
      const altBasePrice = basePrices[altTld] || 200000;
      return {
        domain: altDomain,
        available: check.available,
        price: Math.ceil(altBasePrice * MARKUP),
      };
    })
  );

  return NextResponse.json({
    domain,
    available: mainCheck.available,
    price: markedUpPrice,
    alternatives: alternatives.filter(a => a.available),
  });
}
