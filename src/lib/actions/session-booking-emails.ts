"use server";

import { Resend } from "resend";
import { formatDate } from "../data/data";
import { prisma } from "@/lib/prisma";

// Initialize Resend with your API key
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

interface EmailData {
  trainerId: string;
  clientId: string;
  trainerName: string;
  clientName: string;
  sessionType: string;
  date: string;
  time: string;
  notes?: string;
}

export async function sendBookingConfirmationEmails(data: EmailData) {
  try {
    const formattedDate = formatDate(data.date);
    const trainerEmail = await getTrainerEmail(data.trainerId);
    const clientEmail = await getClientEmail(data.clientId);

    if (!trainerEmail || !clientEmail) {
      return { success: false, error: "Could not find email addresses" };
    }

    console.log("Got Email Data");
    // Send email to trainer
    const trainerEmailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "liamlanders0@gmail.com",
      subject: `New Session Booking: ${data.clientName} - ${formattedDate}`,
      html: getTrainerEmailTemplate(data, formattedDate),
    });
    console.log("Sent to trainer");

    // Send email to client
    const clientEmailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "liamlanders0@gmail.com",
      subject: `Your Training Session with ${data.trainerName} - ${formattedDate}`,
      html: getClientEmailTemplate(data, formattedDate),
    });
    console.log("Sent to Client");
    return {
      success: true,
      trainerEmailId: trainerEmailResult.data?.id,
      clientEmailId: clientEmailResult.data?.id,
    };
  } catch (error) {
    console.error("Error sending emails:", error);
    return { success: false, error };
  }
}

// Helper function to get trainer email - implement based on your data model
async function getTrainerEmail(trainerId: string): Promise<string | null> {
  return await prisma.profile
    .findUnique({ where: { id: trainerId } })
    .then((trainer) => trainer?.email || null);
}

// Helper function to get client email - implement based on your data model
async function getClientEmail(clientId: string): Promise<string | null> {
  return await prisma.profile
    .findUnique({ where: { id: clientId } })
    .then((trainer) => trainer?.email || null);
}

// Email template for trainer
function getTrainerEmailTemplate(
  data: EmailData,
  formattedDate: string
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
          background-color: #4CAF50;
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
          border-left: 4px solid #4CAF50;
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
          <h2>New Session Booking</h2>
        </div>
        <div class="content">
          <p>Hello ${data.trainerName},</p>
          <p>You have a new ${data.sessionType} training session booked with ${data.clientName}.</p>
          
          <div class="details">
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Session Type:</strong> ${data.sessionType} Training</p>
            ${data.notes ? `<p><strong>Client Notes:</strong> ${data.notes}</p>` : ""}
          </div>
          
          <p>Please log in to your dashboard to confirm this booking.</p>
          <p>Thank you,<br>Your Booking System</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email template for client
function getClientEmailTemplate(
  data: EmailData,
  formattedDate: string
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
          background-color: #4CAF50;
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
          border-left: 4px solid #4CAF50;
        }
        .cta-button {
          display: inline-block;
          background-color: #4CAF50;
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
          <h2>Your Training Session is Booked!</h2>
        </div>
        <div class="content">
          <p>Hello ${data.clientName},</p>
          <p>Your ${data.sessionType} training session with ${data.trainerName} has been scheduled.</p>
          
          <div class="details">
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Session Type:</strong> ${data.sessionType} Training</p>
            ${data.notes ? `<p><strong>Your Notes:</strong> ${data.notes}</p>` : ""}
          </div>
          
          <p>Please make sure to arrive 5-10 minutes before your scheduled time.</p>
          <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
          
          <a href="#" class="cta-button">Manage Your Booking</a>
          
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>${data.trainerName}</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
