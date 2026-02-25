import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, listKey, source } = await request.json();

    if (!email || !listKey) {
      return new Response(
        JSON.stringify({ error: "Missing email or listKey" }),
        { status: 400 },
      );
    }

    const zohoToken = import.meta.env.ZOHO_CAMPAIGNS_TOKEN;
    if (!zohoToken) {
      console.warn("[popup-submit] ZOHO_CAMPAIGNS_TOKEN not set, skipping");
      return new Response(
        JSON.stringify({ ok: true, warning: "Zoho token not configured" }),
      );
    }

    const contactInfo = JSON.stringify({
      "Contact Email": email,
      ...(source && { Source: source }),
    });

    const params = new URLSearchParams({
      resfmt: "JSON",
      listkey: listKey,
      contactinfo: contactInfo,
      ...(source && { source }),
    });

    const zohoRes = await fetch(
      `https://campaigns.zoho.com/api/v1.1/json/listsubscribe?${params}`,
      {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${zohoToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data = await zohoRes.json();

    if (data.status === "success" || data.code === "0") {
      return new Response(JSON.stringify({ ok: true, message: data.message }));
    }

    console.error("[popup-submit] Zoho error:", data);
    return new Response(
      JSON.stringify({
        ok: false,
        error: data.message || "Zoho API error",
        code: data.code,
      }),
      { status: 502 },
    );
  } catch (err: any) {
    console.error("[popup-submit] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500 },
    );
  }
};
