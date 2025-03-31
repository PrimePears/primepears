import {
  getAvailabilities,
  getTrainerByClerkUserId,
  getCertifications,
} from "@/lib/data/data";
import CreateProfileForm from "@/components/ui-custom/profile-edit/profile-form";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function Page() {
  const user = await currentUser();
  if (!user) {
    return notFound();
  }
  const id = user?.id;
  const profile = await getTrainerByClerkUserId(id);
  if (!profile) {
    return notFound();
  }
  const availabilities = await getAvailabilities(profile?.id);
  const certifications = await getCertifications(profile?.id);

  return (
    <main>
      <CreateProfileForm
        profile={profile!}
        availabilitiesProp={availabilities}
        certificationProp={certifications}
      />
    </main>
  );
}
