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
}

export default function AvailabilityCard({
  title = "Availability",
  availabilitySlots,
  className,

}: AvailabilityCardProps) {
  return (
    <Card className={`w-full flex flex-col ${className || ""}`}>
      <CardHeader className="pb-2 pt-4 px-4 flex-none">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          All times are posted in EST.
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 flex-grow overflow-auto">
        {availabilitySlots.length > 0 ? (
          <div className="flex flex-col gap-2">
            {availabilitySlots.map((slot, index) => (
              <div
                key={index}
                className="flex flex-row items-center justify-between border border-gray-200 p-2 rounded-lg"
              >
                <h3 className="font-medium text-sm">{slot.day}</h3>
                <div className="flex flex-col items-end">
                  {slot.timeRanges.length > 0 ? (
                    slot.timeRanges.map((timeRange, timeIndex) => (
                      <p
                        key={timeIndex}
                        className="text-xs text-muted-foreground"
                      >
                        {timeRange}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No available times
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground italic">
            Available times have not been set
          </p>
        )}
      </CardContent>
    </Card>
  );
}
