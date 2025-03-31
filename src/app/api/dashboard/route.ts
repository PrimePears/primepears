import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the profile ID from the clerk user ID
    const profile = await prisma.profile.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const now = new Date();

    // Get all bookings for the trainer (upcoming and past)
    const bookings = await prisma.booking.findMany({
      where: {
        trainerId: profile.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Separate bookings into categories
    const pendingBookings = bookings.filter(
      (booking) =>
        new Date(booking.date) >= now &&
        booking.status === BookingStatus.PENDING
    );

    const confirmedBookings = bookings.filter(
      (booking) =>
        new Date(booking.date) >= now &&
        booking.status === BookingStatus.CONFIRMED
    );

    const completedBookings = bookings.filter(
      (booking) =>
        (new Date(booking.date) < now &&
          booking.status === BookingStatus.COMPLETED) ||
        booking.status === BookingStatus.COMPLETED
    );

    const cancelledBookings = bookings.filter(
      (booking) =>
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.NO_SHOW
    );

    return NextResponse.json({
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      all: bookings,
    });
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
