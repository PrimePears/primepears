import type { Metadata } from "next";
import "../app/globals.css";

// import { SpeedInsights } from "@vercel/speed-insights/next";
// import { Analytics } from "@vercel/analytics/next";

import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import NavBar from "@/components/ui-custom/layout/navbar";
import { Footer } from "@/components/ui-custom/layout/footer";
import ReactQueryClientProvider from "../components/ui-custom/database-components/react-query-client-provider";
import { getTrainerByClerkUserId } from "@/lib/data/data";
// import { getTrainerByClerkUserId } from "@/lib/data";
// import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PrimePears",
  description: "Find trainers anywhere",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  if (!user) {
    return (
      <ClerkProvider>
        <html lang="en">
          <body>
            <ReactQueryClientProvider>
              <NavBar profile={null} />
              <main>{children}</main>
              {/* <SpeedInsights /> */}
              {/* <Analytics /> */}
              <Footer></Footer>
            </ReactQueryClientProvider>
            {/* <Toaster /> */}
          </body>
        </html>
      </ClerkProvider>
    );
  } else {
    const id = user?.id;
    const profile = await getTrainerByClerkUserId(id);

    return (
      <ClerkProvider>
        <html lang="en">
          <body>
            <ReactQueryClientProvider>
              <NavBar profile={profile} />
              <main>{children}</main>
              <Footer></Footer>
            </ReactQueryClientProvider>
            {/* <Toaster /> */}
          </body>
        </html>
      </ClerkProvider>
    );
  }
}
