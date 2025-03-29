type FAQ = {
  question: string;
  answer: string;
};

export interface FAQDisplayProps {
  faqs: FAQ[];
}

export const faqContent = [
  {
    question: "What is PrimePears?",
    answer:
      "PrimePears is an online platform that connects individuals with professional personal trainers. Our trainers create customized workout plans, provide coaching, and help you stay accountable—all online.",
  },
  {
    question: "How does PrimePears work?",
    answer:
      "1. Browse our network of trainers and choose one that fits your goals. \n\n2. Schedule a consultation. \n\n3. Select a training package that works for your schedule. \n\n4. Receive personalized training, workout plans, and ongoing support—all from the comfort of your home, gym, or anywhere you prefer.",
  },
  {
    question: "Do I need any equipment?",
    answer:
      "It depends on your goals! Some programs may require minimal equipment, while others can be completely bodyweight-based. Your trainer will customize your program based on what you have available.",
  },
  {
    question: "Who are the trainers on PrimePears?",
    answer:
      "Our trainers are certified professionals with expertise in various fitness disciplines, including strength training, weight loss, mobility, and more. Each trainer is vetted for quality and experience.",
  },
  {
    question: "Can I switch trainers if I want to?",
    answer:
      "Absolutely! If you feel like your trainer isn’t the right fit, you can switch at any time to find someone who better suits your needs. Terms and conditions apply.",
  },
  {
    question: "How do trainers customize workouts?",
    answer:
      "Your trainer will assess your fitness level, goals, and preferences to create a personalized program. Adjustments are made based on your progress and feedback.",
  },
  {
    question: "How much does PrimePears cost?",
    answer:
      "Pricing varies depending on the trainer and the type of program you choose. Some trainers offer one-time workout plans, while others provide ongoing coaching. Check each trainer’s profile for specific rates.",
  },
  {
    question: "Is there a subscription fee?",
    answer:
      "No, there is no platform subscription fee. You only pay for the services you choose, whether it's a single session, a package, or a monthly coaching plan.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we do offer refunds, but they are subject to our platform-wide refund policy. If you need a refund or have questions about eligibility, please contact our support team for assistance.",
  },
  {
    question: "How do I sign up?",
    answer:
      "Simply create an account, browse trainers, and book a consultation. From there, your trainer will guide you through the next steps.",
  },
  {
    question: "Can I train if I’m a beginner?",
    answer:
      "Absolutely! PrimePears is for everyone, no matter your fitness level. Our trainers will tailor workouts to match your experience and goals.",
  },
  {
    question: "Is online personal training effective?",
    answer:
      "Yes! Many people find online training more convenient and flexible than in-person training. With expert guidance, accountability, and customized plans, you can achieve great results from anywhere.",
  },
  {
    question: "What if I have technical issues?",
    answer:
      "If you experience any issues, contact our support team at [info@primepears.com]. We’re here to help!",
  },
  {
    question: "How can I become a trainer on PrimePears?",
    answer:
      "If you're a certified personal trainer and interested in joining our platform, visit our Trainer Sign-Up page for more details.",
  },
];
