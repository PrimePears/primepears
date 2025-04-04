import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { Resend } from "resend";
import { getConfirmationEmailTemplate } from "@/lib/email/confirm-email-template";

// Initialize Resend
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// Helper function to parse time in "3:15 AM" format and add minutes
function addMinutesToTime(timeString: string, minutesToAdd: number): string {
  // Parse the time string
  const [timePart, period] = timeString.split(" ");
  const [hourStr, minuteStr] = timePart.split(":");

  let hour = Number.parseInt(hourStr, 10);
  const minute = Number.parseInt(minuteStr, 10);

  // Convert to 24-hour format for calculation
  if (period === "PM" && hour < 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  // Create a date object to handle time arithmetic
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  // Add the minutes
  date.setMinutes(date.getMinutes() + minutesToAdd);

  // Convert back to 12-hour format
  let newHour = date.getHours();
  const newMinute = date.getMinutes();
  const newPeriod = newHour >= 12 ? "PM" : "AM";

  // Convert hour back to 12-hour format
  if (newHour > 12) {
    newHour -= 12;
  } else if (newHour === 0) {
    newHour = 12;
  }

  // Format the time string
  return `${newHour}:${newMinute.toString().padStart(2, "0")} ${newPeriod}`;
}

export async function PATCH(req: Request) {
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
    const { status, message, date, startTime } = await req.json();

    // Validate status
    if (status !== BookingStatus.CONFIRMED) {
      return new NextResponse("Invalid status for this endpoint", {
        status: 400,
      });
    }

    // Validate date and time
    if (!date || !startTime) {
      return new NextResponse("Date and start time are required", {
        status: 400,
      });
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
        trainer: true, // Include trainer details for the email
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    // Check if the user is the trainer for this booking
    if (booking.trainerId !== profile.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Calculate new end time based on the session duration
    let endTime = booking.endTime;

    // If startTime has changed, we need to recalculate the endTime
    if (startTime !== booking.startTime) {
      // Calculate duration in minutes based on the session duration
      let durationMinutes = 60; // Default to 60 minutes

      switch (booking.duration) {
        case "MINUTES_15":
          durationMinutes = 15;
          break;
        case "MINUTES_60":
          durationMinutes = 60;
          break;
        case "MINUTES_90":
          durationMinutes = 90;
          break;
      }

      // Calculate end time using our helper function
      endTime = addMinutesToTime(startTime, durationMinutes);
    }

    // Update the booking with new date, times, and status
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        date: new Date(date), // Convert string date to DateTime
        startTime,
        endTime,
        status: BookingStatus.CONFIRMED,
        trainerNotes: message
          ? `${booking.trainerNotes || ""}\n\n${new Date().toISOString()}: Session rescheduled and confirmed. New date: ${date}, new time: ${startTime}-${endTime}. Message: ${message}`
          : `${booking.trainerNotes || ""}\n\n${new Date().toISOString()}: Session rescheduled and confirmed. New date: ${date}, new time: ${startTime}-${endTime}.`,
      },
    });

    // Send confirmation email to the client
    if (booking.client.email) {
      try {
        const trainerName = booking.trainer?.name || "Your trainer";
        const clientName = booking.client.name || "there";
        const sessionType = booking.sessionType.toLowerCase().replace("_", " ");

        // Prepare email data
        const emailData = {
          trainerId: booking.trainerId,
          clientId: booking.clientId,
          trainerName: trainerName,
          clientName: clientName,
          sessionType: sessionType,
          date: date,
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

            Date: ${date}
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
    console.error("[BOOKING_EDIT_AND_CONFIRM]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
