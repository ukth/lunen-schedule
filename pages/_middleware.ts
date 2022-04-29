import type { NextRequest, NextFetchEvent } from "next/server";
import { NextResponse } from "next/server";
export function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.ua?.isBot) {
    return new Response("", { status: 403 });
  }
  if (!req.url.includes("/api")) {
    if (
      !req.url.includes("/login") &&
      !req.url.includes("/register") &&
      !req.cookies.carrotsession
    ) {
      return NextResponse.redirect("/login");
    }
  }
}
