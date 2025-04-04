import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Specialties_Card() {
  return (
    <div className="w-full px-4 py-4 sm:py-6">
      <Card className="w-4/5 mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Popular Specialties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8">
            {/* TODO : Fix link /trainers?specialty=strength */}
            <Link href="/" className="w-full">
              <Button className="w-full px-6 py-3 text-lg font-semibold rounded-lg shadow-md text-white bg-custom-button-green hover:bg-custom-button-hover-green transition">
                Strength Trainers
              </Button>
            </Link>
            {/* TODO : Fix link /trainers?specialty=yoga */}
            <Link href="/" className="w-full">
              <Button className="w-full px-6 py-3 text-lg font-semibold rounded-lg shadow-md text-white bg-custom-button-green hover:bg-custom-button-hover-green transition">
                Yoga Trainers
              </Button>
            </Link>
            {/* TODO : Fix link /trainers?specialty=cardio */}

            <Link href="/" className="w-full">
              <Button className="w-full px-6 py-3 text-lg font-semibold rounded-lg shadow-md text-white bg-custom-button-green hover:bg-custom-button-hover-green transition">
                Cardio Trainers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
