"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 20,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  // Create an array of 5 stars
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex">
      {stars.map((star) => {
        // Determine if this star should be filled
        const filled = interactive
          ? star <= (hoverRating || rating)
          : star <= rating;

        return (
          <Star
            key={star}
            size={size}
            className={`${
              filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (interactive && onChange) {
                onChange(star);
              }
            }}
            onMouseEnter={() => {
              if (interactive) {
                setHoverRating(star);
              }
            }}
            onMouseLeave={() => {
              if (interactive) {
                setHoverRating(0);
              }
            }}
          />
        );
      })}
    </div>
  );
}
