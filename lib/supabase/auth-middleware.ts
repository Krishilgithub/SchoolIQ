import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected Routes Handling
  const path = request.nextUrl.pathname;

  // Dashboard protection
  if (path.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Super Admin protection
  if (path.startsWith("/super-admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // Note: Role check ideally happens securely, but for middleware we might need to check DB/metadata
    // For now, letlayout handle detailed RBAC, or we can check here if we fetch profile.
    // Let's rely on layout for granular role checks to avoid extra DB calls in middleware for every request if possible,
    // or fetch profile here.
  }

  // Auth pages redirect for logged in users
  if (path.startsWith("/auth") && user) {
    if (path === "/auth/login" || path === "/auth/register") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
