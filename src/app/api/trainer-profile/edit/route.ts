import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CreateProfileFormSchema } from "@/app/schemas/profile";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the input data
    const validationResult = CreateProfileFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      location,
      rate,
      bio,
      experience,
      videoUrl,
      trainerType,
      displayName,
      twitterLink,
      facebookLink,
      instagramLink,
      youtubeLink,
    } = validationResult.data;

    const { clerkUserId, id } = body;
    const availability = body.availability || [];
    const certifications = body.certifications || [];
    const level = 1;

    // Handle alternate contact information
    const alternateContact = body.alternateContact || null;
    const alternateName = alternateContact?.name || null;
    const alternateEmail = alternateContact?.email || null;

    // Update or create the profile
    const profile = await prisma.profile.upsert({
      where: { id },
      update: {
        name,
        email,
        displayName,
        location,
        level,
        rate,
        bio,
        experience,
        videoUrl,
        trainerType,
        alternateName,
        alternateEmail,
        twitterLink,
        facebookLink,
        instagramLink,
        youtubeLink,
        // socialMediaLinks: socialMediaLinks.length > 0 ? socialMediaLinks : null,
      },
      create: {
        id,
        clerkUserId,
        name,
        email,
        displayName,
        location,
        level,
        rate,
        bio,
        experience,
        videoUrl,
        trainerType,
        alternateName,
        alternateEmail,
        twitterLink,
        facebookLink,
        instagramLink,
        youtubeLink,
        // socialMediaLinks: socialMediaLinks.length > 0 ? socialMediaLinks : null,
        isTrainer: false, // Default value for new profiles
      },
    });

    // Delete existing availability and certifications to replace with new ones
    await prisma.availability.deleteMany({
      where: { userId: profile.id },
    });

    await prisma.certification.deleteMany({
      where: { userId: profile.id },
    });

    // Create new availability entries
    for (const avail of availability) {
      const newAvailability = await prisma.availability.create({
        data: {
          userId: profile.id,
          day: avail.day,
        },
      });

      // Create time ranges for this availability
      for (const timeRange of avail.timeRanges) {
        const [startTime, endTime] = timeRange.split(" - ");
        await prisma.timeRange.create({
          data: {
            availabilityId: newAvailability.id,
            startTime,
            endTime,
          },
        });
      }
    }

    // Create new certification entries
    for (const cert of certifications) {
      await prisma.certification.create({
        data: {
          name: cert.name,
          userId: profile.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: profile.id,
    });
  } catch (error) {
    void error;
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Fetch the profile with related data
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        availability: {
          include: {
            timeRanges: true,
          },
        },
        certifications: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Format the data to match the form structure
    const formattedAvailability = profile.availability.map((avail) => ({
      day: avail.day,
      timeRanges: avail.timeRanges.map(
        (tr) => `${tr.startTime} - ${tr.endTime}`
      ),
    }));

    // Format alternate contact info
    const alternateContact =
      profile.alternateName || profile.alternateEmail
        ? {
            name: profile.alternateName || "",
            email: profile.alternateEmail || "",
          }
        : null;

    return NextResponse.json({
      ...profile,
      availability: formattedAvailability,
      alternateContact,
    });
  } catch (error) {
    void error;
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  // Reuse the POST handler for updates
  return POST(request);
}
