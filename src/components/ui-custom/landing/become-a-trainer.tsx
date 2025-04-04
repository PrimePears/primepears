"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function BecomeATrainer() {
  // const { user } = useUser();
  return (
    <div className="w-full px-4 py-4 sm:py-6">
      <Card className="w-4/5 mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Join Our Team of Trainers!
          </CardTitle>
          <CardDescription className="text-l sm:text-xl text-gray-600">
            {" "}
            Apply now to share your expertise, connect with clients, and grow
            your training business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {/* TODO : Fix link href={`/trainer-profile/edit/${user?.id}`} */}

            <Link href={`/`} className="w-full">
              <Button className="w-full px-6 py-3 text-lg font-semibold rounded-lg shadow-md text-white bg-custom-button-green hover:bg-custom-button-hover-green transition">
                Become a Trainer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
