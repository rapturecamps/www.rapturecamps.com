import type { APIRoute } from "astro";

export const prerender = false;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>Page Removed · Rapture</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0f1a; font-family: system-ui, -apple-system, sans-serif; color: #fff; }
    .wrap { text-align: center; padding: 2rem; }
    .code { font-size: 6rem; font-weight: bold; color: rgba(255,255,255,.15); }
    h1 { margin: 1rem 0; font-size: 1.875rem; }
    p { color: rgba(255,255,255,.4); max-width: 28rem; margin: 1rem auto; }
    .links { margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    a { display: inline-block; padding: .75rem 1.5rem; border-radius: 9999px; font-size: .875rem; font-weight: 600; text-decoration: none; transition: all .2s; }
    .primary { background: #0ea5e9; color: #fff; }
    .primary:hover { background: #38bdf8; }
    .secondary { border: 1px solid rgba(255,255,255,.2); color: #fff; }
    .secondary:hover { background: rgba(255,255,255,.1); }
  </style>
</head>
<body>
  <div class="wrap">
    <p class="code">410</p>
    <h1>Page Permanently Removed</h1>
    <p>This destination is no longer part of the Rapture Surfcamps network. Check out our current surf camp locations instead.</p>
    <div class="links">
      <a href="/" class="primary">Go Home</a>
      <a href="/surfcamp" class="secondary">Browse Destinations</a>
    </div>
  </div>
</body>
</html>`;

export const GET: APIRoute = async () => {
  return new Response(html, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
