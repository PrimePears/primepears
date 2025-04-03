"use client";

import { DialogFooter } from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

type Booking = {
  id: string;
  clientId: string;
  client: {
    name: string;
    email?: string;
  };
  sessionType: "CONSULTATION" | "FULL_SESSION";
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: string;
};

type AlternativeTime = {
  date: string;
  startTime: string;
};

interface AlternateTimesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: (message: string, alternativeTimes: AlternativeTime[]) => void;
}

export function AlternateTimesDialog({
  open,
  onOpenChange,
  booking,
  onConfirm,
}: AlternateTimesDialogProps) {
  // Parse time from "3:15 AM" format to separate components
  const parseTime = (timeString: string) => {
    if (!timeString) return { hour: "12", minute: "00", period: "AM" };

    const [timePart, period] = timeString.split(" ");
    const [hour, minute] = timePart.split(":");

    return {
      hour: hour,
      minute: minute,
      period: period,
    };
  };

  // Format time components back to "3:15 AM" format
  const formatTime = (hour: string, minute: string, period: string) => {
    return `${hour}:${minute} ${period}`;
  };

  const [alternativeTimes, setAlternativeTimes] = useState<AlternativeTime[]>([
    { date: "", startTime: "" },
  ]);
  const [timeComponents, setTimeComponents] = useState<
    Array<{ hour: string; minute: string; period: string }>
  >([{ hour: "12", minute: "00", period: "AM" }]);
  const [message, setMessage] = useState<string>("");

  // Function to format date from the booking object
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Fix the handleOpenChange function to properly set the default message
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && booking) {
      // Initialize with default message and one empty time slot when dialog opens
      // const sessionDate = formatDate(booking.date);
      // Set the message state directly
      // setMessage(
      //   `Hi ${booking.client.name},\n\nI'm unable to accommodate our session on ${sessionDate} at ${booking.startTime}. Would any of these alternative times work for you?\n\nPlease let me know which option works best, or if none of these work for your schedule.`
      // );
      setAlternativeTimes([{ date: "", startTime: "" }]);
      setTimeComponents([{ hour: "12", minute: "00", period: "AM" }]);
    }
    onOpenChange(newOpen);
  };

  // Add this useEffect hook after the state declarations to ensure the message is set when the dialog opens
  useEffect(() => {
    if (open && booking) {
      const sessionDate = formatDate(booking.date);
      setMessage(
        `Hi ${booking.client.name},\n\nI'm unable to accommodate our session on ${sessionDate} at ${booking.startTime}. Would any of these alternative times work for you?\n\nPlease let me know which option works best, or if none of these work for your schedule.`
      );
    }
  }, [open, booking]);

  const handleAddTimeSlot = () => {
    setAlternativeTimes([...alternativeTimes, { date: "", startTime: "" }]);
    setTimeComponents([
      ...timeComponents,
      { hour: "12", minute: "00", period: "AM" },
    ]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    const newTimes = [...alternativeTimes];
    newTimes.splice(index, 1);
    setAlternativeTimes(newTimes);

    const newTimeComponents = [...timeComponents];
    newTimeComponents.splice(index, 1);
    setTimeComponents(newTimeComponents);
  };

  const handleTimeComponentChange = (
    index: number,
    component: "hour" | "minute" | "period",
    value: string
  ) => {
    const newTimeComponents = [...timeComponents];
    newTimeComponents[index][component] = value;
    setTimeComponents(newTimeComponents);

    // Update the actual startTime in alternativeTimes
    const newTimes = [...alternativeTimes];
    newTimes[index].startTime = formatTime(
      newTimeComponents[index].hour,
      newTimeComponents[index].minute,
      newTimeComponents[index].period
    );
    setAlternativeTimes(newTimes);
  };

  const calculateEndTime = (startTime: string): string => {
    if (!startTime || !startTime.includes(":")) return "";

    try {
      const { hour, minute, period } = parseTime(startTime);
      let hours = Number.parseInt(hour);
      const minutes = Number.parseInt(minute);

      // Convert to 24-hour format
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      // Add duration based on session type
      if (booking?.sessionType === "CONSULTATION") {
        date.setMinutes(date.getMinutes() + 15);
      } else if (booking?.sessionType === "FULL_SESSION") {
        date.setHours(date.getHours() + 1);
      }

      // Convert back to 12-hour format
      let endHours = date.getHours();
      const endMinutes = date.getMinutes();
      const endPeriod = endHours >= 12 ? "PM" : "AM";

      if (endHours > 12) endHours -= 12;
      if (endHours === 0) endHours = 12;

      return `${endHours}:${String(endMinutes).padStart(2, "0")} ${endPeriod}`;
    } catch (e) {
      return "";
    }
  };

  const handleConfirm = () => {
    // Filter out incomplete time slots
    const validTimes = alternativeTimes
      .filter((time) => time.date && time.startTime)
      .map((time) => ({
        date: time.date,
        startTime: time.startTime,
      }));

    // Only proceed if we have at least one valid time
    if (validTimes.length === 0) {
      alert("Please add at least one complete alternative time slot");
      return;
    }

    onConfirm(message, validTimes);
  };

  // Generate next 14 days for date selection
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const displayDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      dates.push({ value: dateStr, label: displayDate });
    }

    return dates;
  };

  const dateOptions = generateDateOptions();

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"];

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Propose Alternative Times</DialogTitle>
          <DialogDescription>
            Suggest alternative times for this session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Original Session Details</Label>
            <div className="rounded-md border p-2 bg-muted/50">
              <div>
                <strong>Client:</strong> {booking.client.name}
              </div>
              <div>
                <strong>Date:</strong> {formatDate(booking.date)}
              </div>
              <div>
                <strong>Time:</strong> {booking.startTime} - {booking.endTime}
              </div>
              <div>
                <strong>Type:</strong> {booking.sessionType}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Alternative Time Slots</Label>
            {alternativeTimes.map((time, index) => (
              <div key={index} className="flex gap-3 items-start mb-4">
                <div className="grid gap-4 flex-1">
                  {/* Date selector */}
                  <div>
                    <Label className="mb-1 block">Session Date</Label>
                    <Input
                      type="date"
                      id={`editDate-${index}`}
                      value={time.date}
                      onChange={(e) => {
                        const newTimes = [...alternativeTimes];
                        newTimes[index].date = e.target.value;
                        setAlternativeTimes(newTimes);
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <Label className="mb-1 block">Start Time</Label>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={timeComponents[index].hour}
                        onValueChange={(value) =>
                          handleTimeComponentChange(index, "hour", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {hourOptions.map((hour) => (
                            <SelectItem
                              key={`start-hour-${hour}-${index}`}
                              value={hour}
                            >
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="flex items-center">:</span>

                      <Select
                        value={timeComponents[index].minute}
                        onValueChange={(value) =>
                          handleTimeComponentChange(index, "minute", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {minuteOptions.map((minute) => (
                            <SelectItem
                              key={`start-minute-${minute}-${index}`}
                              value={minute}
                            >
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={timeComponents[index].period}
                        onValueChange={(value) =>
                          handleTimeComponentChange(index, "period", value)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* End time display (calculated) */}
                  <div>
                    <Label className="mb-1 block">End Time (Preview)</Label>
                    <div className="rounded-md border p-2 bg-muted/50">
                      {calculateEndTime(time.startTime) || "--:--"}
                    </div>
                  </div>
                </div>

                {/* Remove button - only show for slots after the first one */}
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTimeSlot(index)}
                    className="mt-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {/* Add time slot button */}
            <Button
              variant="outline"
              type="button"
              onClick={handleAddTimeSlot}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Time Slot
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message to Client</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Send Proposal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
