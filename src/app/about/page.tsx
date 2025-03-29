import AboutUsPage from "@/components/ui-custom/company-info/about";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ & Contact | Prime Pears",
  description:
    "Frequently asked questions and contact information for Prime Pears",
};

export default function AboutPage() {
  return (
    <main>
      <section id="about">
        <AboutUsPage />
      </section>
    </main>
  );
}
