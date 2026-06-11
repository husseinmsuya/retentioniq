import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/upload(.*)",
  "/customers(.*)",
  "/predictions(.*)",
  "/segments(.*)",
  "/revenue(.*)",
  "/insights(.*)",
  "/recommendations(.*)",
  "/reports(.*)",
  "/alerts(.*)",
  "/settings(.*)",
  "/user-profile(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);

    await auth.protect({
      unauthenticatedUrl: signInUrl.toString()
    });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};