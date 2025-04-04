import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getCancellationEmailTemplate } from "@/lib/email/cancellation-email-template";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      trainerId,
      clientId,
      trainerName,
      clientName,
      clientEmail,
      sessionType,
      date,
      startTime,
      endTime,
      message,
    } = body;

    // Validate required fields
    if (!clientEmail || !trainerName || !clientName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailData = {
      trainerId,
      clientId,
      trainerName,
      clientName,
      sessionType,
      date,
      startTime,
      endTime,
      message,
    };

    const emailHtml = getCancellationEmailTemplate(emailData);

    const data = await resend.emails.send({
      from: "notifications@primepears.com",
      to: clientEmail,
      subject: `Session Cancelled: ${sessionType} with ${trainerName}`,
      html: emailHtml,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return NextResponse.json(
      { error: "Failed to send cancellation email" },
      { status: 500 }
    );
  }
}
