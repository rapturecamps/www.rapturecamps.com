import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const { path } = await request.json();

    if (!path || typeof path !== "string") {
      return new Response(JSON.stringify({ error: "Missing path" }), {
        status: 400,
      });
    }

    if (path.startsWith("http")) {
      try {
        const res = await fetch(path, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(5000),
        });
        return new Response(
          JSON.stringify({ status: res.status, ok: res.ok }),
        );
      } catch {
        return new Response(
          JSON.stringify({ status: 0, ok: false, error: "Unreachable" }),
        );
      }
    }

    const base = `${url.protocol}//${url.host}`;
    try {
      const res = await fetch(`${base}${path}`, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
        headers: { "X-URL-Check": "1" },
      });
      return new Response(
        JSON.stringify({ status: res.status, ok: res.ok }),
      );
    } catch {
      return new Response(
        JSON.stringify({ status: 0, ok: false, error: "Unreachable" }),
      );
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }
};
