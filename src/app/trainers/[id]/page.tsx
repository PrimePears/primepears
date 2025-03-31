import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAvailabilities,
  getCertifications,
  getTrainerById,
  getTrainerByClerkUserId,
  getTrainerReviews,
  hasCompletedBooking,
} from "@/lib/data/data";

import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import TrainerCard from "@/components/ui-custom/profile/first-section/trainer-card";
import TrainerInfoSection from "@/components/ui-custom/profile/second-section/trainer-info";
import ReviewsSection from "@/components/ui-custom/profile/third-section/review-section";

export default async function PersonProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsId = await params;
  const profile = await getTrainerById(paramsId.id);
  if (!profile) {
    notFound();
  }
  const availabilities = await getAvailabilities(profile?.id);
  const certifications = await getCertifications(profile?.id);

  const { userId } = await auth();

  let clientId = undefined;
  if (userId) {
    clientId = await getTrainerByClerkUserId(userId);
  }

  if (!profile) {
    notFound();
  }
  const availabilityData = availabilities.map((availability) => ({
    day: availability.day,
    timeRanges: availability.timeRanges.map(
      (tr) => `${tr.startTime} - ${tr.endTime}`
    ),
  }));

  // Fetch reviews for this trainer
  const reviews = await getTrainerReviews(profile.id);

  // Check if the current user has completed a booking with this trainer
  const canLeaveReview = await hasCompletedBooking(profile.id, clientId?.id);

  return (
    <div>
      <Link href="/trainers" className="inline-flex">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to trainer list
        </Button>
      </Link>
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="space-y-4">
          <TrainerCard
            profile={profile!}
            // availabilitiesProp={availabilities}
            // certificationProp={certifications}
          />

          <TrainerInfoSection
            certifications={certifications}
            profile={profile}
            availabilitySlots={availabilityData}
          />

          {/* Reviews section */}

          <ReviewsSection
            trainerId={profile.id}
            clientId={clientId?.id}
            reviews={reviews}
            hasCompletedBooking={canLeaveReview}
          />
        </CardContent>
      </Card>
    </div>
  );
}
