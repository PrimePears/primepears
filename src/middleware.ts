import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/sign-in(.*)",
  "/browse-trainers(.*)",
  "/trainers(.*)",
  "/about(.*)",
  "/faq(.*)",
  "/contact-us(.*)",
  "/api/get-profile(.*)",
]);

const isSignUpRoute = createRouteMatcher(["/sign-up(.*)"]);

const isTrainersRoute = createRouteMatcher(["/trainers(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const userAuth = await auth();
    const { userId } = userAuth;
    const { pathname, origin } = req.nextUrl;

    if (!isPublicRoute(req) && !userId) {
      return NextResponse.redirect(new URL("/sign-up", origin));
    }

    return NextResponse.next();
  } catch (e) {
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
