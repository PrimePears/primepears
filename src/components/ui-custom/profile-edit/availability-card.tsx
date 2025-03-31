import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface AvailabilitySlot {
  day: string;
  timeRanges: string[];
}

interface AvailabilityCardProps {
  title?: string;
  availabilitySlots: AvailabilitySlot[];
  className?: string;
  layout?: "grid" | "row"; // New prop to control layout
}

export default function AvailabilityCard({
  title = "Availability",
  availabilitySlots,
  className,
  layout = "grid",
}: AvailabilityCardProps) {
  const isTwoColumn = availabilitySlots.length > 4;
  const isOdd = availabilitySlots.length % 2 !== 0;

  return (
    <div className="flex flex-col items-center mx-auto w-[95%] sm:w-[90%] md:w-4/5">
      <Card className={`w-full ${className || ""}`}>
        <CardHeader className="pb-3 flex items-center justify-center">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          All times are posted in EST.
        </CardHeader>
        <CardContent>
          <div
            className={`
              flex gap-4 w-full text-center 
              ${
                layout === "grid"
                  ? `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${
                      isTwoColumn ? "3" : "2"
                    } lg:grid-cols-${isTwoColumn ? "4" : "3"}`
                  : "flex-row flex-wrap justify-center items-center"
              }
            `}
          >
            {availabilitySlots.length > 0 ? (
              availabilitySlots.map((slot, index) => (
                <div
                  key={index}
                  className={`
                    space-y-1 w-full min-w-[150px] border border-gray-200 p-4 rounded-lg
                    ${
                      layout === "grid" &&
                      isTwoColumn &&
                      isOdd &&
                      index === availabilitySlots.length - 1
                        ? "col-span-full md:col-span-1 justify-self-center max-w-[250px]"
                        : ""
                    }
                  `}
                >
                  {slot.timeRanges.length > 0 ? (
                    <>
                      <h3 className="font-medium text-sm md:text-base text-center">
                        {slot.day}
                      </h3>
                      <div className="border-t-2 border-primary/20 pt-2 space-y-2">
                        {slot.timeRanges.map((timeRange, timeIndex) => (
                          <p
                            key={timeIndex}
                            className="text-sm text-muted-foreground text-center"
                          >
                            {timeRange}
                          </p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center">
                      No available times
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground italic w-full">
                Available times have not been set
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
