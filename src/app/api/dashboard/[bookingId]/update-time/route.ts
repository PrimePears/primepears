import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { formatDate } from "@/lib/data/data";

// Initialize Resend
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

interface UpdateTimeEmailData {
  trainerId: string;
  clientId: string;
  trainerName: string;
  clientName: string;
  sessionType: string;
  message: string;
  originalDate: string;
  originalStartTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

// Email template for updated session time
function getUpdateTimeEmailTemplate(data: UpdateTimeEmailData): string {
  const formatTimeForDisplay = (timeStr: string) => {
    // If time is already in AM/PM format, return it as is
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      return timeStr;
    }

    // Otherwise convert from 24-hour format
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const originalDateTime = `${formatDate(data.originalDate)} at ${formatTimeForDisplay(data.originalStartTime)}`;
  const newDateTime = `${formatDate(data.newDate)} at ${formatTimeForDisplay(data.newStartTime)}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Helvetica', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .container {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .header {
          background-color: #188977;
          color: white;
          padding: 15px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          background-color: white;
          border-radius: 0 0 8px 8px;
        }
        .details {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-left: 4px solid #188977;
        }
        .cta-button {
          display: inline-block;
          background-color: #188977;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Your ${data.sessionType} Session Has Been Rescheduled</h2>
        </div>
        <div class="content">
          <p>Hello ${data.clientName},</p>
          
          ${data.message ? `<p>${data.message}</p>` : ""}
          
          <div class="details">
            <p><strong>Original Schedule:</strong><br>
            ${originalDateTime}</p>
            
            <p><strong>New Schedule:</strong><br>
            ${newDateTime} to ${formatTimeForDisplay(data.newEndTime)}</p>
          </div>
          
          <p>If you have any questions or need to make additional changes, please contact ${data.trainerName}.</p>
          
          <a href="www.primepears.com" class="cta-button">View Your Session</a>
          
          <p>Thank you,<br>${data.trainerName}</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const bookingId = pathParts[pathParts.indexOf("dashboard") + 1];

    const { date, startTime, endTime, message } = await req.json();

    // Validate input
    if (!date || !startTime || !endTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    console.log("Date: ", date);
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

    // Store original values for record and email
    const originalDate = booking.date;
    const originalStartTime = booking.startTime;
    const originalEndTime = booking.endTime;

    // Update the booking with the new time
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        date: date,
        startTime: startTime,
        endTime: endTime,
        trainerNotes: booking.trainerNotes
          ? `${booking.trainerNotes}\n\n${new Date().toISOString()}: Session time updated from ${formatDate(originalDate.toISOString())} ${originalStartTime}-${originalEndTime} to ${formatDate(date)} ${startTime}-${endTime}.\n\nMessage Sent: ${message}`
          : `${new Date().toISOString()}: Session time updated from ${formatDate(originalDate.toISOString())} ${originalStartTime}-${originalEndTime} to ${formatDate(date)} ${startTime}-${endTime}.\n\nMessage Sent: ${message}`,
      },
    });

    // Send email to the client about the time update
    if (booking.client.email) {
      try {
        const trainerName = booking.trainer?.name || "Your trainer";
        const clientName = booking.client.name || "there";
        const sessionType = booking.sessionType.toLowerCase().replace("_", " ");

        // Prepare email data
        const emailData: UpdateTimeEmailData = {
          trainerId: booking.trainerId,
          clientId: booking.clientId,
          trainerName: trainerName,
          clientName: clientName,
          sessionType: sessionType,
          message: message,
          originalDate: originalDate.toISOString(),
          originalStartTime: originalStartTime,
          newDate: date,
          newStartTime: startTime,
          newEndTime: endTime,
        };
        console.log("Email Data: ", emailData);

        const htmlContent = getUpdateTimeEmailTemplate(emailData);

        // Create plain text version
        const plainText = `
          Hello ${clientName},

          ${message}

          Original Schedule:
          ${formatDate(originalDate.toISOString())} at ${originalStartTime}

          New Schedule:
          ${formatDate(date)} at ${startTime} to ${endTime}

          If you have any questions or need to make additional changes, please contact ${trainerName}.

          Thank you,
          ${trainerName}
        `;

        // Send the email using Resend
        const { data, error } = await resend.emails.send({
          from: `onboarding@resend.dev`,
          to: "info@primepears.com", // TODO: Change to booking.client.email in production
          subject: `Your ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session Has Been Rescheduled`,
          html: htmlContent,
          text: plainText,
        });

        if (error) {
          console.error("Email sending failed:", error);
        } else {
          console.log("Email sent successfully:", data);
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Continue with the response even if email fails
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[BOOKING_UPDATE_TIME_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
