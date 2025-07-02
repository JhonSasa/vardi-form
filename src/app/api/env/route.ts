// src/app/api/env/route.ts
export async function GET() {
  return Response.json({
    sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  });
}