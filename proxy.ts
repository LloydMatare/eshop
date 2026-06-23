import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/shipping(.*)",
  "/payment(.*)",
  "/place-order(.*)",
  "/order(.*)",
  "/order-history(.*)",
  "/order-tracking(.*)",
  "/profile(.*)",
  "/admin(.*)",
  "/api/admin(.*)",
  "/api/orders(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/signin(.*)",
  "/register(.*)",
  "/api/products(.*)",
  "/api/auth(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
    "/api/(.*)",
  ],
};
