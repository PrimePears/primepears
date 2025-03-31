import type { Review, Booking, Profile } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "./star-rating";
import ReviewForm from "./review-form";
import { formatDistanceToNow } from "date-fns";

type ReviewWithBookingAndClient = Review & {
  booking: Booking & {
    client: Profile;
  };
};

interface ReviewsSectionProps {
  trainerId: string;
  clientId?: string;
  reviews: ReviewWithBookingAndClient[];
  hasCompletedBooking: boolean;
}

export default function ReviewsSection({
  trainerId,
  clientId,
  reviews,
  hasCompletedBooking,
}: ReviewsSectionProps) {
  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <Card className="mt-6 w-full mx-auto sm:w-11/12 md:w-10/12 lg:w-4/5">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Reviews ({reviews.length})</span>
          {reviews.length > 0 && (
            <div className="flex items-center text-sm font-normal">
              <span className="mr-2">Average Rating:</span>
              <StarRating rating={averageRating} size={18} />
              <span className="ml-2 font-medium">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No reviews yet. Be the first to leave a review!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-0">
                    <div className="font-medium">
                      {review.booking.client.name}
                    </div>
                    <div className="hidden sm:block mx-2 text-muted-foreground">
                      •
                    </div>
                    <StarRating rating={review.rating} size={16} />
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm sm:text-base">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Show review form only if the user is a client and has completed a booking with this trainer */}
        {clientId && clientId !== trainerId && hasCompletedBooking && (
          <ReviewForm trainerId={trainerId} clientId={clientId} />
        )}
      </CardContent>
    </Card>
  );
}
