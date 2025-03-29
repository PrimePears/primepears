import Image from "next/image";

export default function Why_Us_Section() {
  return (
    <main className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="min-h-screen w-full grid md:grid-cols-2 items-center">
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center order-2 md:order-1">
          <h1 className="text-2xl md:text-5xl lg:text-4xl font-bold mb-2">
            Personalized Training
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            Every program is tailored to your unique goals, fitness level, and
            lifestyle—no generic workouts here.
          </p>
          <h1 className="text-2xl md:text-5xl lg:text-4xl font-bold mb-2">
            Top-Tier Trainers
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            Work with certified trainers who specialize in various fitness
            disciplines, from weight loss to strength building and mobility.
          </p>
        </div>
        <div className="relative w-full h-screen order-1 md:order-2">
          <Image
            src="/logo/prime_pear_logo.png"
            alt="Fitness trainer working with client"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Second Section - Reversed on desktop */}
      <section className="min-h-screen w-full grid md:grid-cols-2 items-center">
        <div className="relative w-full h-screen order-1">
          <div className="absolute inset-0">
            <Image
              src="/logo/prime_pear_logo.png"
              alt="Professional fitness trainers"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-black text-white order-2 h-full">
          <h1 className="text-2xl md:text-5xl lg:text-4xl font-bold mb-2">
            100% Online & Flexible
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            Train anytime, anywhere—no gym memberships or rigid schedules
            required. Perfect for busy lifestyles
          </p>
          <h1 className="text-2xl md:text-5xl lg:text-4xl font-bold mb-2">
            Accountability & Support
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            Stay motivated with direct communication, progress tracking, and
            expert guidance from your trainer.
          </p>
        </div>
      </section>

      {/* Third Section */}
      <section className="min-h-screen w-full grid md:grid-cols-2 items-center mb-8">
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center order-2 md:order-1">
          <h1 className="text-2xl md:text-5xl lg:text-4xl font-bold mb-2">
            Affordable & Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            No hidden fees or subscriptions—only pay for the training you need.
          </p>
          <h1 className="text-2xl md:text-5xl lg:text-4xl font-bold mb-2">
            Results-Driven Approach
          </h1>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            We focus on real progress with sustainable, science-backed training
            methods that deliver results.
          </p>
        </div>
        <div className="relative w-full h-screen order-1 md:order-2">
          <Image
            src="/logo/prime_pear_logo.png"
            alt="Diverse fitness clients"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>
    </main>
  );
}
