"use server";

// Function to send cancellation email
export async function sendCancellationEmail(
  trainerId: string,
  clientId: string,
  trainerName: string,
  clientName: string,
  clientEmail: string,
  sessionType: string,
  date: string,
  startTime: string,
  endTime: string,
  message: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/email/cancellation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send cancellation email");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendCancellationEmail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
