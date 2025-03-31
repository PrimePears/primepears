import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const bookingId = pathParts[pathParts.indexOf("dashboard") + 1];
    const { status, message } = await req.json();

    // Validate status
    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
      return new NextResponse("Invalid status", { status: 400 });
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

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        client: true,
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    // Check if the user is the trainer for this booking
    if (booking.trainerId !== profile.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: status as BookingStatus,
        trainerNotes: message
          ? `${booking.trainerNotes || ""}\n\n${new Date().toISOString()}: Status changed to ${status}. Message: ${message}`
          : undefined,
      },
    });

    // Here you would typically send an email to the client with the message
    // This is a placeholder for the email sending logic
    if (message && booking.client.email) {
      console.log(
        `Sending email to ${booking.client.email} with message: ${message}`
      );
      // await sendEmail({ //TODO implement email sending logic
      //   to: booking.client.email,
      //   subject: `Your training session has been ${status.toLowerCase()}`,
      //   text: message,
      // });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[BOOKING_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
