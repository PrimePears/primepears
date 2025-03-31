"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SessionType, SessionDuration, BookingStatus } from "@prisma/client";

export type BookingFormData = {
  trainerId: string;
  clientId: string;
  sessionType: SessionType;
  duration: SessionDuration;
  date: string;
  startTime: string;
  notes?: string;
};

export async function createBooking(data: BookingFormData) {
  try {
    // Calculate end time based on duration
    const endTime = calculateEndTime(data.startTime, data.duration);

    console.log(data);
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        trainerId: data.trainerId,
        clientId: data.clientId,
        sessionType: data.sessionType,
        duration: data.duration,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: endTime,
        status: BookingStatus.PENDING,
        notes: data.notes || null,
        // Set price based on session type and duration
        price: calculatePrice(data.sessionType, data.duration),
        isPaid: false,
      },
    });

    revalidatePath("/bookings");
    return { success: true, booking };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: "Failed to create booking. Please try again.",
    };
  }
}

// Helper function to calculate end time based on start time and duration
function calculateEndTime(
  startTime: string,
  duration: SessionDuration
): string {
  // Parse the start time
  const [hourStr, minuteStr] = startTime.split(":");
  const isPM = startTime.toLowerCase().includes("pm");
  const isAM = startTime.toLowerCase().includes("am");

  let hour = Number.parseInt(hourStr);
  const minute = Number.parseInt(minuteStr) || 0;

  // Convert to 24-hour format if needed
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  // Create a date object to handle time calculations
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  // Add duration minutes
  let durationMinutes = 0;
  switch (duration) {
    case SessionDuration.MINUTES_15:
      durationMinutes = 15;
      break;
    case SessionDuration.MINUTES_60:
      durationMinutes = 60;
      break;
    case SessionDuration.MINUTES_90:
      durationMinutes = 90;
      break;
  }

  date.setMinutes(date.getMinutes() + durationMinutes);

  // Format the end time
  const endHour = date.getHours();
  const endMinute = date.getMinutes();

  const formattedHour = endHour % 12 === 0 ? 12 : endHour % 12;
  const period = endHour >= 12 ? "PM" : "AM";

  return `${formattedHour}:${endMinute.toString().padStart(2, "0")} ${period}`;
}

// Helper function to calculate price based on session type and duration
function calculatePrice(
  sessionType: SessionType,
  duration: SessionDuration
): number | null {
  if (sessionType === SessionType.CONSULTATION) {
    return null; // Free consultation
  }

  if (sessionType === SessionType.FULL_SESSION) {
    if (duration === SessionDuration.MINUTES_60) {
      return 75; // $75 for 60-minute session
    } else if (duration === SessionDuration.MINUTES_90) {
      return 110; // $110 for 90-minute session
    }
  }

  return null;
}
