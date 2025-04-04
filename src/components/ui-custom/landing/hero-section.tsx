"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";

export default function HeroSectionCard() {
  const router = useRouter();
  const { user } = useUser();

  const handleSpecialtyChange = (value: string) => {
    router.push(`/trainers?specialty=${value}`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden p-4">
      <Image
        src="/landing/HeroSection.jpg"
        priority
        alt="Hero Image"
        fill
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      <div className="relative z-20 container mx-auto px-4 h-full flex justify-center items-center">
        <div className="w-4/5 max-w-lg mx-auto">
          <Card className="w-full bg-white shadow-lg rounded-lg text-center">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-semibold ">
                Welcome to PrimePears
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Discover our professional trainers that fit your goals,
                lifestyle, and schedule.
              </p>
            </CardContent>
            <CardFooter className="w-full flex justify-center">
              <Select onValueChange={handleSpecialtyChange}>
                <SelectTrigger className="w-full max-w-xs text-white data-[placeholder]:text-white bg-custom-button-green hover:bg-custom-button-hover-green transition font-semibold rounded-lg">
                  <SelectValue placeholder="Select a Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength Trainers</SelectItem>
                  <SelectItem value="yoga">Yoga Trainers</SelectItem>
                  <SelectItem value="cardio">Cardio Trainers</SelectItem>
                </SelectContent>
              </Select>
            </CardFooter>
          </Card>

          {/* <SignedIn>
            <div className="mt-6">
              <Card className="w-full bg-white shadow-lg rounded-lg text-center">
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl font-semibold ">
                    Become a Trainer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Apply to join our platform!</p>
                </CardContent>
                <CardFooter className="w-full flex justify-center">
                  <Link
                    href={`/trainer-profile/edit/${user?.id}`}
                    className="w-full max-w-xs"
                  >
                    <Button className="w-full px-6 py-3 text-lg font-semibold rounded-lg shadow-md text-white bg-custom-button-green hover:bg-custom-button-hover-green transition">
                      Apply Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </SignedIn> */}
        </div>
      </div>
    </div>
  );
}
