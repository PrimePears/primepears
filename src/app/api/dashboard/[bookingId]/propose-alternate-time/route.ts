import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { formatDate } from "@/lib/data/data";

// Initialize Resend
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

type AlternativeTime = {
  date: string;
  startTime: string;
  endTime?: string; // Make endTime optional since it's calculated
};

interface AlternativeTimesEmailData {
  trainerId: string;
  clientId: string;
  trainerName: string;
  clientName: string;
  sessionType: string;
  message?: string;
  alternativeTimes: AlternativeTime[];
}

// Email template for alternative session times proposed by trainer
function getAlternativeTimesEmailTemplate(
  data: AlternativeTimesEmailData
): string {
  const timesHtml = data.alternativeTimes
    .map((time) => {
      const formattedDate = formatDate(time.date);
      console.log(time.startTime, " +  ", time.endTime);
      console.log(`${time.startTime} to ${time.endTime as string}`);
      return `
        <li style="margin-bottom: 10px; padding: 10px; border-left: 4px solid #188977;">
          <strong>${formattedDate}</strong><br>
          ${time.startTime} to ${time.endTime as string}
        </li>
      `;
    })
    .join("");

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
        .alternative-times {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .alternative-times ul {
          list-style-type: none;
          padding-left: 0;
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
          <h2>Alternative Times for Your ${data.sessionType} Session</h2>
        </div>
        <div class="content">
          <p>Hello ${data.clientName},</p>
          <p>${data.trainerName} has proposed alternative times for your upcoming session:</p>
          ${data.message ? `<p>${data.message}</p>` : ""}
          
          <div class="alternative-times">
            <h3>Proposed Alternative Times:</h3>
            <ul>
              ${timesHtml}
            </ul>
          </div>
          
          <p>Please reply to this email or contact ${data.trainerName} to confirm which time works for you.</p>
          <a href="www.primepears.com" class="cta-button">Respond to Proposal</a>
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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const bookingId = pathParts[pathParts.indexOf("dashboard") + 1];
    //
    // const bookingId = await params.bookingId; // Extract bookingId from route params
    const { message, alternativeTimes } = await req.json();

    // Validate input
    if (!message || !alternativeTimes || alternativeTimes.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 });
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

    // Calculate end times based on session type if not provided
    const timesWithEndTimes = alternativeTimes.map((time: AlternativeTime) => {
      let endTime = time.endTime;

      if (!endTime && time.startTime) {
        // Calculate end time based on session type
        const [hours, minutes] = time.startTime.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        if (booking.sessionType === "CONSULTATION") {
          date.setMinutes(date.getMinutes() + 15);
        } else {
          date.setHours(date.getHours() + 1);
        }

        endTime = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      }

      return {
        ...time,
        endTime,
      };
    });

    const formattedTimes = timesWithEndTimes
      .map((time: AlternativeTime & { endTime: string }) => {
        // Format the date
        const date = new Date(time.date);
        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return `- ${formattedDate} from ${time.startTime} to ${time.endTime}`;
      })
      .join("\n");
    // Update the booking with the proposed alternative times in the notes
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        trainerNotes: booking.trainerNotes
          ? `${booking.trainerNotes}\n\n${new Date().toISOString()}: Proposed alternative times:\n${formattedTimes}\n\nMessage Sent: ${message}`
          : `${new Date().toISOString()}: Proposed alternative times:\n${formattedTimes}\n\nMessage Sent: ${message}`,
      },
    });

    // Send email to the client with the alternative times
    if (booking.client.email) {
      try {
        const trainerName = booking.trainer?.name || "Your trainer";
        const clientName = booking.client.name || "there";
        const sessionType = booking.sessionType.toLowerCase().replace("_", " ");

        // Use the new email template function
        const emailData: AlternativeTimesEmailData = {
          trainerId: booking.trainerId,
          clientId: booking.clientId,
          trainerName: trainerName,
          clientName: clientName,
          sessionType: sessionType,
          message: message,
          alternativeTimes: timesWithEndTimes,
        };

        const htmlContent = getAlternativeTimesEmailTemplate(emailData);

        // Send the email using Resend
        const { error } = await resend.emails.send({
          from: `onboarding@resend.dev`,
          to: "info@primepears.com", //TODO Change this email variable
          subject: `Alternative Times for Your ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`,
          html: htmlContent,
          text: `Hello ${clientName},\n\n${trainerName} has proposed alternative times for your upcoming session:\n\n${message}\n\nProposed Alternative Times Am I here:\n${formattedTimes}\n\nPlease reply to this email or contact ${trainerName} to confirm which time works for you.\n\nThank you,\n${trainerName}`,
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
    console.error("[BOOKING_PROPOSE_ALTERNATES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
