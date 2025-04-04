import { formatDate } from "@/lib/data/data";

interface ConfirmationEmailData {
  trainerId: string;
  clientId: string;
  trainerName: string;
  clientName: string;
  sessionType: string;
  date: string;
  startTime: string;
  endTime: string;
  message?: string;
}

// Email template for session confirmation
export function getConfirmationEmailTemplate(
  data: ConfirmationEmailData
): string {
  const formatTime = (timeStr: string) => {
    // Handle "3:15 AM" format
    if (timeStr.includes(" ")) {
      return timeStr;
    }

    // Handle "15:30" format
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const formattedDate = formatDate(data.date);
  const formattedStartTime = formatTime(data.startTime);
  const formattedEndTime = formatTime(data.endTime);

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
          <h2>Your ${data.sessionType} Session is Confirmed</h2>
        </div>
        <div class="content">
          <p>Hello ${data.clientName},</p>
          <p>${data.trainerName} has confirmed your upcoming session:</p>
          
          <div class="details">
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedStartTime} to ${formattedEndTime}</p>
            <p><strong>Session Type:</strong> ${data.sessionType}</p>
          </div>
          
          ${data.message ? `<p><strong>Message from ${data.trainerName}:</strong> ${data.message}</p>` : ""}
          
          <p>We look forward to seeing you!</p>
          <a href="www.primepears.com" class="cta-button">View Session Details</a>
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
