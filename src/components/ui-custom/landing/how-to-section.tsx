import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function How_To_Section() {
  return (
    <div className="w-full px-4 py-4 sm:py-6">
      <Card className="w-4/5 mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-900">
            How to find a personal trainer?
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-500">
            Learn online with the world&apos;s best trainers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8">
            {/* Search Section */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/logo/prime_pear_logo.png"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                  style={{ objectFit: "cover" }}
                  alt="Step One:"
                  priority
                />
              </div>
              <div className="max-w-xs">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Step One
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Explore our network of certified trainers, each with unique
                  specialties like weight loss, strength training, mobility, and
                  more. Check their profiles, read reviews, and find one that
                  fits your goals.
                </p>
              </div>
            </div>

            {/* Select Section */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/logo/prime_pear_logo.png"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                  style={{ objectFit: "cover" }}
                  alt="Step Two"
                />
              </div>
              <div className="max-w-xs">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Step Two
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Once you find a trainer that matches your needs, book a
                  consultation or sign up for a program. Your trainer will
                  assess your fitness level, goals, and preferences to create a
                  personalized plan.
                </p>
              </div>
            </div>

            {/* Start Section */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/logo/prime_pear_logo.png"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                  style={{ objectFit: "cover" }}
                  alt="Step Three"
                />
              </div>
              <div className="max-w-xs">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Step Three
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Follow your trainer&apos;s customized workout plan, get expert
                  guidance, and stay accountable—all online. Adjustments are
                  made as you progress to ensure you stay on track toward your
                  fitness goals.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
