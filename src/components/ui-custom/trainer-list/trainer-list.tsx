import {
  extractYouTubeId,
  type Certification,
  type Profile,
} from "@/lib/data/data";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import Link from "next/link";

import { YouTubeEmbed } from "@next/third-parties/google";

interface TrainerListProps {
  trainers?: Profile[];
  certificationProp: Certification[];
}

export default function TrainerList({
  trainers = [],
  certificationProp = [],
}: TrainerListProps) {
  const certifications = certificationProp;

  return (
    <div className="flex flex-col items-center p-10 pt-2 pb-0 min-h-screen">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Available Trainers ({trainers.length})
      </h1>

      {/* Trainer Cards */}
      <div className="w-full md:w-11/12 lg:w-4/5">
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <Card key={trainer.id} className="mb-6 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Main content */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:flex-1 w-full items-center">
                    {/* Left: Profile Image */}




                    
                    <Link
                      href={`/trainers/${trainer.id}`}
                      key={trainer.id}
                      className="flex-shrink-0 mx-auto sm:mx-0"
                    >
                      {/* Updated Avatar to match TrainerCard styling */}
                      <Avatar className="w-48 h-48 rounded-md overflow-hidden flex items-center">
                        <AvatarImage
                          src={
                            trainer?.profileImage
                              ? `/profile-pictures/${trainer.profileImage}`
                              : "/avatar.svg"
                          }
                        />
                        <AvatarFallback>
                          {trainer?.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* Middle: Trainer Details */}
                    <div className="flex-1 text-center sm:text-left self-center">
                      <Link href={`/trainers/${trainer.id}`} key={trainer.id}>
                        <h2 className="text-xl font-semibold text-foreground">
                          {trainer.name}
                        </h2>
                      </Link>

                      {/* Verified Badge */}
                      <p className="text-green-600 font-medium">
                        ✓ Verified Certificates
                      </p>

                      {/* Certifications List */}
                      <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                        {certifications.filter(
                          (cert) => cert.userId === trainer.id
                        ).length > 0 ? (
                          certifications
                            .filter((cert) => cert.userId === trainer.id)
                            .map((cert) => (
                              <Badge
                                key={cert.id}
                                variant="outline"
                                className="bg-green-200 text-green-800 max-w-[150px] whitespace-normal text-center h-auto py-1"
                              >
                                {cert.name}
                              </Badge>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No certifications available
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      <p className="text-muted-foreground flex items-center mt-2 justify-center sm:justify-start">
                        <MapPin className="w-4 h-4 text-green-600 mr-1" />
                        {trainer.location}
                      </p>
                    </div>

                    {/* Right: Booking & Pricing */}
                    <div className="text-center sm:text-right flex-shrink-0 mt-4 sm:mt-0 self-center">
                      <p className="text-muted-foreground text-sm">
                        Online:{" "}
                        <span className="text-green-600 font-semibold">
                          {trainer.rate} CA$/hour
                        </span>
                      </p>
                      <Link href={`/trainers/${trainer.id}`} key={trainer.id}>
                        <Button className="mt-2 bg-custom-button-green hover:bg-custom-button-hover-green text-white">
                          Book a free consultation
                        </Button>
                      </Link>
                      <p className="text-muted-foreground text-xs mt-1 mx-auto sm:ml-auto sm:mr-0 max-w-[200px]">
                        Have a free 15-minute call with this trainer to see if
                        it&apos;s the right fit.
                      </p>
                    </div>
                  </div>

                  {/* YouTube embed */}
                  <div className="w-full lg:w-[30%] lg:max-w-[350px] mt-4 lg:mt-0 flex-shrink-0 self-center">
                    <div
                      className="relative w-full overflow-hidden bg-black rounded-lg"
                      style={{ paddingTop: "56.25%" }}
                    >
                      {trainer.videoUrl && (
                        <div className="absolute inset-0">
                          <YouTubeEmbed
                            videoid={extractYouTubeId(trainer.videoUrl) || ""}
                            style="width:100%;height:100%;"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium mb-2">No trainers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
