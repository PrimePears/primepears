import { Card, CardContent } from "@/components/ui/card";
import { extractYouTubeId, getTrainerByClerkUserId } from "@/lib/data/data";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { MapPin } from "lucide-react";
import { YouTubeEmbed } from "@next/third-parties/google";
import type { Profile } from "@prisma/client";
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "./icons";
import BookingButtons from "./booking-buttons";
import { auth } from "@clerk/nextjs/server";

interface AvailabilitySchedulerProps {
  profile: Profile;
}

export default async function TrainerCard({
  profile,
}: AvailabilitySchedulerProps) {
  const { userId } = await auth();
  let clientId = undefined;
  if (userId) {
    clientId = await getTrainerByClerkUserId(userId);
  }
  const url = extractYouTubeId(profile.videoUrl); // Extract the YouTube video ID from the profile's YouTube link
  // Create dynamic social links array based on profile data
  const socialLinks = [
    profile.twitterLink && {
      name: "Twitter",
      icon: TwitterIcon,
      url: "https://x.com/" + profile.twitterLink,
    },
    profile.facebookLink && {
      name: "Facebook",
      icon: FacebookIcon,
      url: "https://www.facebook.com/" + profile.facebookLink,
    },
    profile.instagramLink && {
      name: "Instagram",
      icon: InstagramIcon,
      url: "https://www.instagram.com/" + profile.instagramLink,
    },
    profile.youtubeLink && {
      name: "YouTube",
      icon: YoutubeIcon,
      url: "https://www.youtube.com/@" + profile.youtubeLink,
    },
  ].filter(Boolean); // Filter out null/undefined values

  // let video = extractYouTubeId(url);
  // if (!url) {
  //   url = url || "dQw4w9WgXcQ"; // Fallback to a default video ID if extraction fails
  // }

  const displayName = profile.alternateName
    ? profile.alternateName
    : profile.name;

  return (
    <div className="flex flex-col items-center mx-auto w-[95%] sm:w-[90%] md:w-4/5">
      <Card key={profile?.id} className="w-full">
        <CardContent className="pt-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center items-center gap-6 ">
            {/* Left: Profile Image */}
            <Avatar className="w-48 h-48 rounded-md overflow-hidden flex items-center ">
              <AvatarImage
                src={
                  profile.profileImage
                    ? `/profile-pictures/${profile.profileImage}`
                    : "/avatar.svg"
                }
              />
              <AvatarFallback>{profile?.name.substring(0, 2)}</AvatarFallback>
            </Avatar>

            {/* Middle: Trainer Details */}
            <div className="flex-[2] text-center md:text-left">
              <h2 className="text-xl font-semibold text-foreground">
                {displayName}
              </h2>
              <div className="mt-1">
                <p className="text-sm">
                  Rate:{" "}
                  <span className="text-green-600 font-semibold">
                    {profile?.rate} CA$/hour
                  </span>
                </p>
              </div>

              {/* Location */}
              <p className="flex items-center justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-green-600 mr-1" />
                {profile?.location}
              </p>

              {/* Social Links - Only display if links exist in profile */}
              {socialLinks.length > 0 && (
                <div className="flex flex-row space-x-4 items-center justify-center md:justify-start">
                  {socialLinks.map((link) => {
                    if (!link) return null; // Ensure link is not null or undefined
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                      >
                        <Icon size={17} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-4">
              <BookingButtons
                trainerName={displayName}
                trainerId={profile.id}
                clientId={clientId?.id}
              />
            </div>

            {/* Right: Video */}
            <div className="relative rounded-lg overflow-hidden bg-black w-full md:w-[355px] aspect-video">
              <div className="absolute inset-0">
                <YouTubeEmbed videoid={url || ""} style="w-full h-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
