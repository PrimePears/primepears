import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type AlternativeTime = {
  date: string;
  startTime: string;
  endTime?: string; // Make endTime optional since it's calculated
};

export async function POST(
  req: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookingId = await params.bookingId; // Extract bookingId from route params
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

    // Format the alternative times for the notes
    const formattedTimes = timesWithEndTimes
      .map((time: AlternativeTime & { endTime: string }) => {
        // Convert 24-hour format to 12-hour format for display
        const formatTime = (timeStr: string) => {
          const [hours, minutes] = timeStr.split(":").map(Number);
          const period = hours >= 12 ? "PM" : "AM";
          const hour12 = hours % 12 || 12;
          return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
        };

        // Format the date
        const date = new Date(time.date);
        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return `- ${formattedDate} from ${formatTime(time.startTime)} to ${formatTime(time.endTime)}`;
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

    // Here you would typically send an email to the client with the alternative times
    // This is a placeholder for the email sending logic
    if (booking.client.email) {
      console.log(
        `Sending email to ${booking.client.email} with alternative times:`
      );
      console.log(`Message: ${message}`);
      console.log(`Alternative times: ${formattedTimes}`); //TODO send email
      // await sendEmail({
      //   to: booking.client.email,
      //   subject: `Alternative times for your training session`,
      //   text: `${message}\n\n${formattedTimes}`,
      // });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[BOOKING_PROPOSE_ALTERNATES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
