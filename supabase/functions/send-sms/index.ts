import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { phone, businessName, lowStockItems } = await req.json();
    const itemList = lowStockItems
      .map((p) => `${p.name}: ${p.current_stock} left (min: ${p.low_stock_threshold})`)
      .join(", ");
    const message = `StockGuard Alert for ${businessName}: Low stock - ${itemList}. Please restock.`;
    const formattedPhone = phone.startsWith("0") ? "+263" + phone.slice(1) : phone;
    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey": "atsk_bc3eaab32f8cdafce398d72b2374e4ce398ecbd2b2189aabcf7734a8611247843f262faf",
      },
      body: new URLSearchParams({ username: "stockguard", to: formattedPhone, message }),
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
});
