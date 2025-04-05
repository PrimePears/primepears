import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// Email template for booking status updates
function getStatusUpdateEmailTemplate(
  clientName: string,
  trainerName: string,
  status: string,
  message: string
): string {
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
          <h2>Your Session Status Has Been Updated</h2>
        </div>
        <div class="content">
          <p>Hello ${clientName},</p>
          <p>Your session has been <strong>${status.toLowerCase()}</strong> by ${trainerName}.</p>
          
          <div class="details">
            <p>${message}</p>
          </div>
          
          <p>If you have any questions, please contact ${trainerName} directly.</p>
          <a href="www.primepears.com" class="cta-button">View Session Details</a>
          <p>Thank you,<br>${trainerName}</p>
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

    // Send email to the client with the status update
    if (message && booking.client.email) {
      try {
        const trainerName = booking.trainer?.name || "Your trainer";
        const clientName = booking.client.name || "there";

        // Use the email template function
        const htmlContent = getStatusUpdateEmailTemplate(
          clientName,
          trainerName,
          status,
          message
        );

        // Send the email using Resend
        const { error } = await resend.emails.send({
          from: `onboarding@resend.dev`,
          to: "info@primepears.com", // TODO: Change this to booking.client.email in production
          subject: `Your training session has been ${status.toLowerCase()}`,
          html: htmlContent,
          text: `Hello ${clientName},\n\nYour session has been ${status.toLowerCase()} by ${trainerName}.\n\n${message}\n\nIf you have any questions, please contact ${trainerName} directly.\n\nThank you,\n${trainerName}`,
        });

        if (error) {
          console.error("Email sending failed:", error);
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Continue with the response even if email fails
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[BOOKING_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
