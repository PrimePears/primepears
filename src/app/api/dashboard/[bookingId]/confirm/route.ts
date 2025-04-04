import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { Resend } from "resend";
import { getConfirmationEmailTemplate } from "@/lib/email/confirm-email-template";

// Initialize Resend
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract booking ID from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const bookingId = pathParts[pathParts.indexOf("dashboard") + 1];

    // Parse request body
    const { message } = await req.json();

    // Get the profile ID from the clerk user ID
    const profile = await prisma.profile.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Get the booking with related data
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        client: true,
        trainer: true,
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    // Check if the user is the trainer for this booking
    if (booking.trainerId !== profile.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the booking status to CONFIRMED and add trainer notes
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.CONFIRMED,
        trainerNotes: message
          ? `${booking.trainerNotes || ""}\n\n${new Date().toISOString()}: Session confirmed. Message: ${message}`
          : `${booking.trainerNotes || ""}\n\n${new Date().toISOString()}: Session confirmed.`,
      },
    });

    // Send confirmation email to the client
    if (booking.client.email) {
      try {
        const trainerName = booking.trainer?.name || "Your trainer";
        const clientName = booking.client.name || "there";
        const sessionType = booking.sessionType.toLowerCase().replace("_", " ");
        const { date, startTime, endTime } = booking;

        // Format date for display if it's a Date object
        const formattedDate =
          date instanceof Date ? date.toISOString().split("T")[0] : date;

        // Prepare email data
        const emailData = {
          trainerId: booking.trainerId,
          clientId: booking.clientId,
          trainerName: trainerName,
          clientName: clientName,
          sessionType: sessionType,
          date: formattedDate,
          startTime: startTime,
          endTime: endTime,
          message: message,
        };

        // Generate HTML content using our template
        const htmlContent = getConfirmationEmailTemplate(emailData);

        // Plain text version for email clients that don't support HTML
        const textContent = `
            Hello ${clientName},

            ${trainerName} has confirmed your upcoming session:

            Date: ${formattedDate}
            Time: ${startTime} to ${endTime}
            Session Type: ${sessionType}

            ${message ? `Message from ${trainerName}: ${message}` : ""}

            We look forward to seeing you!

            Thank you,
            ${trainerName}

            This is an automated message. Please do not reply directly to this email.
        `;

        // Send the email using Resend
        const { data, error } = await resend.emails.send({
          from: `onboarding@resend.dev`,
          to: "info@primepears.com", // TODO: Change to booking.client.email in production
          subject: `Your ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session is Confirmed`,
          html: htmlContent,
          text: textContent,
        });

        if (error) {
          console.error("Email sending failed:", error);
        } else {
          console.log("Confirmation email sent successfully:", data);
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Continue with the response even if email fails
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[BOOKING_CONFIRM]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
