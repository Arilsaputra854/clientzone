import { NextResponse } from "next/server";
import { adminDb } from "@/../firebase/admin";

export async function GET(req: Request) {
  try {
    // 1. Get all active orders that have a deployed URL
    const ordersSnapshot = await adminDb.collection("orders")
      .where("status", "==", "ACTIVE")
      .get();

    const results = [];

    for (const doc of ordersSnapshot.docs) {
      const order = doc.data();
      const url = order.serverCredentials?.deployedUrl || order.deployedUrl;

      if (!url) continue;

      let isUp = false;
      let responseTime = 0;
      const start = Date.now();

      try {
        // Attempt to hit the server
        const res = await fetch(url, { 
          method: "GET", 
          next: { revalidate: 0 },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        isUp = res.status >= 200 && res.status < 400;
        responseTime = Date.now() - start;
      } catch (error) {
        isUp = false;
        responseTime = Date.now() - start;
      }

      // Update Order Status in Firestore
      await adminDb.collection("orders").doc(doc.id).update({
        lastCheck: new Date(),
        isUp,
        lastResponseTime: responseTime
      });

      // Record log for history (optional, but good for charts)
      await adminDb.collection("uptime_logs").add({
        orderId: doc.id,
        userId: order.userId,
        url,
        isUp,
        responseTime,
        timestamp: new Date()
      });

      results.push({ id: doc.id, url, isUp, responseTime });
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    });
  } catch (error: any) {
    console.error("Uptime Scan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
