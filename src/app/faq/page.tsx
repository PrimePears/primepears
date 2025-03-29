import FaqSection from "@/components/ui-custom/company-info/faq";
import { faqContent } from "@/lib/data-faq";

export default function FaqPage() {
  return (
    <main className="container px-4 py-6 mx-auto w-4/5">
      <section id="faqAndContactSection">
        <FaqSection faqs={faqContent} />
      </section>
    </main>
  );
}
