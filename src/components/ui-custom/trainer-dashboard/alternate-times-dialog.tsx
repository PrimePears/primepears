"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/data/data";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Booking = {
  id: string;
  client: {
    name: string;
    email?: string;
  };
  sessionType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: string;
};

type AlternativeTime = {
  date: string;
  startTime: string;
  endTime: string;
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
  const [message, setMessage] = useState("");
  const [alternativeTimes, setAlternativeTimes] = useState<AlternativeTime[]>([
    { date: "", startTime: "", endTime: "" },
  ]);

  if (!booking) return null;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Initialize with default message and one empty time slot
      const sessionDate = formatDate(booking.date);
      setMessage(
        `Hi ${booking.client.name},\n\nI'm unable to accommodate our session on ${sessionDate} at ${booking.startTime}. Would any of these alternative times work for you?\n\nPlease let me know which option works best, or if none of these work for your schedule.`
      );
      setAlternativeTimes([{ date: "", startTime: "", endTime: "" }]);
    }
    onOpenChange(open);
  };

  const handleAddTimeSlot = () => {
    setAlternativeTimes([
      ...alternativeTimes,
      { date: "", startTime: "", endTime: "" },
    ]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    const newTimes = [...alternativeTimes];
    newTimes.splice(index, 1);
    setAlternativeTimes(newTimes);
  };

  const handleTimeChange = (
    index: number,
    field: keyof AlternativeTime,
    value: string
  ) => {
    const newTimes = [...alternativeTimes];
    newTimes[index][field] = value;
    setAlternativeTimes(newTimes);
  };

  const handleConfirm = () => {
    // Filter out incomplete time slots
    const validTimes = alternativeTimes.filter(
      (time) => time.date && time.startTime && time.endTime
    );

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

  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const times = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      for (const minute of [0, 30]) {
        const hourStr = hour.toString().padStart(2, "0");
        const minuteStr = minute.toString().padStart(2, "0");
        const timeStr = `${hourStr}:${minuteStr}`;

        // Format for display (12-hour clock)
        const hourDisplay = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? "AM" : "PM";
        const displayTime = `${hourDisplay}:${minuteStr} ${ampm}`;

        times.push({ value: timeStr, label: displayTime });
      }
    }

    return times;
  };

  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

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
              <div key={index} className="flex gap-2 items-start mb-2">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {/* Date selector */}
                  <Select
                    value={time.date}
                    onValueChange={(value) =>
                      handleTimeChange(index, "date", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateOptions.map((date) => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Start time selector */}
                  <Select
                    value={time.startTime}
                    onValueChange={(value) =>
                      handleTimeChange(index, "startTime", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* End time selector */}
                  <Select
                    value={time.endTime}
                    onValueChange={(value) =>
                      handleTimeChange(index, "endTime", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Remove button - only show for slots after the first one */}
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTimeSlot(index)}
                    className="mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAddTimeSlot}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Time Slot
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
