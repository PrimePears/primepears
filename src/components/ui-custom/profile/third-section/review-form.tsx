"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { createReview } from "@/lib/actions/review";
import { toast } from "sonner";

interface ReviewFormProps {
  trainerId: string;
  clientId: string;
}

export default function ReviewForm({ trainerId, clientId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast("Please select a rating before submitting your review.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        trainerId,
        clientId,
        rating,
        comment,
      });

      toast("Thank you for your feedback!");

      // Reset form
      setRating(0);
      setComment("");
    } catch (error) {
      console.log(error);
      toast("You may only submit 1 review per session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Rating</label>
          <StarRating
            rating={rating}
            interactive={true}
            onChange={setRating}
            size={24}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium">
            Comment (optional)
          </label>
          <Textarea
            id="comment"
            placeholder="Share your experience with this trainer..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}
