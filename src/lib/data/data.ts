import { prisma } from "@/lib/prisma";
export interface Profile {
  id: string;
  clerkUserId: string;
  name: string;
  email: string;
  alternateName: string | null;
  alternateEmail: string | null;
  isTrainer: boolean;
  trainerType: string | null;
  bio: string | null;
  experience: string | null;
  videoUrl: string;
  twitterLink: string | null;
  instagramLink: string | null;
  facebookLink: string | null;
  youtubeLink: string | null;
  // socialMediaLinks: string | null;
  location: string;
  rate: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  availability?: AvailabilitySlot[];
  certifications?: Certification[];
}

export interface AvailabilitySlot {
  id: string;
  date: Date;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  isRecurring: boolean;
  recurringType?: RecurringType;
  recurringEndDate?: Date;
}

export type RecurringType = "daily" | "weekly" | "monthly";

export interface TimeRange {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  id: string;
  day: string;
  timeRanges: TimeRange[];
}

export interface Certification {
  id: string;
  userId?: string;
  name: string;
}

export async function getTrainerById(id: string) {
  const user = await prisma.profile.findUnique({
    where: { id },
  });
  if (!user) return null;

  return user;
}

export async function getTrainerByClerkUserId(userId: string) {
  const user = await prisma.profile.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    return null;
  }

  return user;
}
