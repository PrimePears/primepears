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
  profileImage: string | null;
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

export async function getAllTrainers() {
  const trainers = await prisma.profile.findMany({
    where: {
      isTrainer: true,
    },
  });
  return trainers;
}

export async function getAllCertifications() {
  try {
    const certifications = await prisma.certification.findMany();

    return certifications;
  } catch (error) {
    console.error("Failed to fetch certifications:", error);
    return [];
  }
}

export function formatDate(dateString: string): string {
  const datePart = dateString.split("T")[0];

  // Parse the date parts
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSessionType(type: string): string {
  switch (type) {
    case "CONSULTATION":
      return "Consultation";
    case "FULL_SESSION":
      return "Personal Training";
    default:
      return type.replace("_", " ").toLowerCase();
  }
}

export async function getAvailabilities(
  userId: string
): Promise<DayAvailability[]> {
  try {
    const availabilities = await prisma.availability.findMany({
      where: { userId },
      include: {
        timeRanges: true,
      },
    });

    return availabilities;
  } catch (error) {
    console.error("Failed to fetch availabilities:", error);
    return [];
  }
}

export async function getCertifications(
  userId: string
): Promise<Certification[]> {
  try {
    const certifications = await prisma.certification.findMany({
      where: { userId },
    });

    return certifications;
  } catch (error) {
    console.error("Failed to fetch certifications:", error);
    return [];
  }
}

export async function getTrainerReviews(trainerId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          trainerId,
        },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews;
  } catch (error) {
    console.error("Error fetching trainer reviews:", error);
    return [];
  }
}

export async function hasCompletedBooking(
  trainerId: string,
  clientId?: string
) {
  if (!clientId) return false;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        trainerId,
        clientId,
        status: "COMPLETED",
      },
    });

    return !!booking;
  } catch (error) {
    console.error("Error checking completed bookings:", error);
    return false;
  }
}
