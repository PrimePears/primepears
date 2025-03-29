import Image from "next/image";

export default function AboutUsPage() {
  return (
    <main className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="min-h-screen w-full grid md:grid-cols-2 items-center">
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            Our Story
          </h1>
          <p className="text-lg md:text-xl leading-relaxed">
            PrimePears was founded on the belief that fitness should be
            accessible, flexible, and tailored to individual needs. What started
            as a simple idea among friends—connecting people with expert
            trainers online—quickly grew into a platform designed to remove
            barriers to personal training. No more expensive gym memberships,
            scheduling conflicts, or one-size-fits-all programs. With
            PrimePears, we bring professional guidance straight to you, wherever
            you are, helping you achieve your goals on your terms.
          </p>
        </div>
        <div className="relative w-full h-screen order-1 md:order-2">
          <Image
            src="/logo/prime_pear_logo.png" //TODO: Update with a more relevant image
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
              src="/logo/prime_pear_logo.png" //TODO: Update with a more relevant image
              alt="Professional fitness trainers"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-black text-white order-2 h-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            Our Trainers
          </h1>
          <p className="text-lg md:text-xl leading-relaxed">
            Our trainers are experienced professionals who are passionate about
            helping clients reach their full potential. They specialize in a
            variety of disciplines, from strength training and weight loss to
            mobility and athletic performance. Every trainer on PrimePears is
            vetted for expertise, communication skills, and their ability to
            create personalized programs that deliver results. No matter your
            fitness level, our trainers are here to guide, support, and push you
            toward success.
          </p>
        </div>
      </section>

      {/* Third Section */}
      <section className="min-h-screen w-full grid md:grid-cols-2 items-center">
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            Our Clients
          </h1>
          <p className="text-lg md:text-xl leading-relaxed">
            PrimePears is built for everyone—whether you&apos;re a beginner
            looking to start your fitness journey, an athlete aiming to
            fine-tune your performance, or someone simply trying to stay
            consistent with healthy habits. Our clients come from all walks of
            life but share one common goal: self-improvement. With our flexible
            online coaching, PrimePears makes it easy to fit personal training
            into your lifestyle, no matter how busy you are.
          </p>
        </div>
        <div className="relative w-full h-screen order-1 md:order-2">
          <Image
            src="/logo/prime_pear_logo.png" //TODO: Update with a more relevant image
            alt="Diverse fitness clients"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Fourth Section - Reversed on desktop */}
      <section className="min-h-screen w-full grid md:grid-cols-2 items-center mb-8">
        <div className="relative w-full h-screen order-1">
          <Image
            src="/logo/prime_pear_logo.png" //TODO: Update with a more relevant image
            alt="PrimePears mission in action"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-black text-white order-2 h-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            Our Mission
          </h1>
          <p className="text-lg md:text-xl leading-relaxed">
            Our mission is simple: to make high-quality personal training
            accessible to everyone. We believe fitness should be convenient,
            affordable, and tailored to individual needs. By bridging the gap
            between trainers and clients through technology, we empower people
            to take control of their health and fitness with expert support at
            their fingertips. At PrimePears, we&apos;re redefining what personal
            training looks like in a digital world—one session at a time.
          </p>
        </div>
      </section>
    </main>
  );
}
