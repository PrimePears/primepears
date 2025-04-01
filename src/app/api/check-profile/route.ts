// import { currentUser } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const user = await currentUser();

//   if (!user) {
//     return NextResponse.redirect(
//       new URL("/sign-in", process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "")
//     );
//   }

//   // Check if user has a profile (this is an example - implement your actual check)
//   // You could check user metadata or query your database
//   const hasProfile = user.publicMetadata?.hasProfile === true;

//   if (!hasProfile) {
//     console.log("User does not have a profile:", hasProfile);
//     // Redirect to create profile if they don't have one
//     return NextResponse.redirect(
//       new URL(
//         "/create-profile",
//         process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || ""
//       )
//     );
//   }

//   // If they have a profile, redirect to dashboard
//   return NextResponse.redirect(
//     new URL("/trainers", process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "")
//   );
// }
