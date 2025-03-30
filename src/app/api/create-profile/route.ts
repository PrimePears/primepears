import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const email = clerkUser?.emailAddresses[0].emailAddress || "";
    if (!email) {
      return NextResponse.json(
        { error: "User does not have an email address." },
        { status: 400 }
      );
    }

    const name = clerkUser.fullName;
    if (!name) {
      return NextResponse.json(
        { error: "User does not have a name." },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (existingProfile) {
      return NextResponse.json({ message: "Profile already exists." });
    }

    await prisma.profile.create({
      data: {
        clerkUserId: clerkUser.id,
        email,
        name: name,
        bio: "Temporary Bio",
        experience: "Temporary Experience",
        videoUrl: "Temporary Video URL",
        rate: 9999,
        level: 9999,
        location: "Temporary Location",
        isTrainer: false,
      },
    });

    return NextResponse.json(
      { message: "Profile create successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error });
  }
}
