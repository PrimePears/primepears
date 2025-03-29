"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { FAQDisplayProps } from "@/lib/data-faq";

export default function FAQDisplay({ faqs }: FAQDisplayProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Function to format the answer with line breaks before numbers
  const formatAnswer = (answer: string) => {
    // Replace numbered points with line breaks before them
    return answer.replace(/\s(\d+)\.\s/g, "\n\n$1. ");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-center">
        Frequently Asked Questions
      </h1>

      <h3 className="text-muted-foreground text-center">
        Find answers to the most common questions about our services, policies,
        and procedures.
      </h3>

      {faqs.map((faq, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="p-0">
            <button
              className="flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none"
              onClick={() => toggleFaq(index)}
            >
              <CardTitle>{faq.question}</CardTitle>
              <ChevronDown
                className={`transition-transform ${
                  openFaq === index ? "rotate-180" : ""
                }`}
              />
            </button>
          </CardHeader>

          {openFaq === index && (
            <CardContent className="border-t pt-4">
              {formatAnswer(faq.answer)
                .split("\n\n")
                .map((paragraph, i) => (
                  <p key={i} className={i > 0 ? "mt-4" : ""}>
                    {paragraph}
                  </p>
                ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
