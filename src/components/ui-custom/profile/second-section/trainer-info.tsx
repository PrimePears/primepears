"use client";

import { CertificatesCard } from "./experience-card";
import AvailabilityCard from "./availability-card";
import type { Certification, Profile } from "@/lib/data/data";

interface ProfileCardsLayoutProps {
  certifications?: Certification[];
  profile?: Profile;
  availabilitySlots: {
    day: string;
    timeRanges: string[];
  }[];
}

export default function TrainerInfoSection({
  certifications = [],
  profile,
  availabilitySlots = [],
}: ProfileCardsLayoutProps) {
  return (
    <div>
      <div className="md:w-4/5 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Certificates card takes 2/3 of the space on large screens */}
          <div className="lg:col-span-2 h-full flex">
            <CertificatesCard
              certificationProp={certifications}
              profile={profile}
              className="h-full flex-1 flex flex-col"
            />
          </div>

          {/* Availability card takes 1/3 of the space on large screens */}
          <div className="lg:col-span-1 h-full flex">
            <AvailabilityCard
              availabilitySlots={availabilitySlots}
              className="h-full flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
