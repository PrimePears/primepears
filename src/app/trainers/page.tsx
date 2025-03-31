import { getAllCertifications, getAllTrainers } from "@/lib/data/data";
import FilteredTrainerList from "@/components/ui-custom/trainer-list/filtered-trainer-list";

export default async function Trainers() {
  const allCertifications = await getAllCertifications();
  const allTrainers = await getAllTrainers();

  return (
    <div>
      <FilteredTrainerList
        trainers={allTrainers}
        certifications={allCertifications}
      />
    </div>
  );
}
