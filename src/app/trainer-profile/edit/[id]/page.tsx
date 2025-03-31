import {
  getAvailabilities,
  getTrainerByClerkUserId,
  getCertifications,
} from "@/lib/data/data";
import CreateProfileForm from "@/components/ui-custom/profile-edit/profile-form";
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const user = await currentUser();
  const id = user?.id!;
  const profile = await getTrainerByClerkUserId(id);
  const availabilities = await getAvailabilities(profile?.id!);
  const certifications = await getCertifications(profile?.id!);
  // const [profile, availabilities] = await Promise.all([getTrainerByUserId(id), getAvailabilities(id)]);

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
