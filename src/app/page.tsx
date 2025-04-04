import "../app/globals.css";
import HeroSection from "../components/ui-custom/landing/hero-section";
import Specialties_Card from "@/components/ui-custom/landing/specialties-section";
import How_To_Section from "@/components/ui-custom/landing/how-to-section";
import Why_Us_Section from "@/components/ui-custom/landing/why-us-section";
import BecomeATrainer from "@/components/ui-custom/landing/become-a-trainer";

export default function LandingPage() {
  return (
    <div>
      <div>
        <HeroSection />
      </div>

      <div>
        <Specialties_Card />
      </div>
      <div>
        <How_To_Section />
      </div>
      <div className="flex items-center justify-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
          Why Choose Us
        </h1>
      </div>
      <div>
        {" "}
        <Why_Us_Section />
      </div>
      <div>
        <BecomeATrainer />
      </div>
    </div>
  );
}
