"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

interface CreateReviewParams {
  trainerId: string;
  clientId: string;
  rating: number;
  comment?: string;
}

export async function createReview({
  trainerId,
  clientId,
  rating,
  comment,
}: CreateReviewParams) {
  try {
    // Find the most recent completed booking between this client and trainer
    const booking = await prisma.booking.findFirst({
      where: {
        trainerId,
        clientId,
        status: "COMPLETED",
        review: null, // Ensure there's no review already
      },
      orderBy: {
        date: "desc",
      },
    });

    if (!booking) {
      throw new Error("No eligible booking found to review");
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        rating,
        comment,
      },
    });

    // Revalidate the trainer profile page
    revalidatePath(`/trainers/${trainerId}`);

    return review;
  } catch (error) {
    console.error("Error creating review:", error);
    throw new Error("Failed to create review");
  }
}

export async function getTrainerReviews(trainerId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          trainerId,
        },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews;
  } catch (error) {
    console.error("Error fetching trainer reviews:", error);
    return [];
  }
}

export async function hasCompletedBooking(trainerId: string, clientId: string) {
  if (!clientId) return false;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        trainerId,
        clientId,
        status: "COMPLETED",
      },
    });

    return !!booking;
  } catch (error) {
    console.error("Error checking completed bookings:", error);
    return false;
  }
}
