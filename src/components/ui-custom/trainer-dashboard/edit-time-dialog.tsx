"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface EditTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: (
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    message: string
  ) => void;
}

export function EditTimeDialog({
  open,
  onOpenChange,
  booking,
  onConfirm,
}: EditTimeDialogProps) {
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

  const [date, setDate] = useState("");
  const [startTimeComponents, setStartTimeComponents] = useState({
    hour: "12",
    minute: "00",
    period: "AM",
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

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
      void e;
      return dateString;
    }
  };

  // Initialize form when dialog opens or booking changes
  useEffect(() => {
    if (open && booking) {
      setDate(booking.date);

      const parsedTime = parseTime(booking.startTime);
      setStartTimeComponents(parsedTime);
      setStartTime(booking.startTime);
      setEndTime(booking.endTime);

      // Set default message
      const sessionDate = formatDate(booking.date);
      setMessage(
        `Hi ${booking.client.name},\n\nI need to reschedule our session that was originally scheduled for ${sessionDate} at ${booking.startTime}. The new time will be listed below.\n\nPlease let me know if this works for you.`
      );
    }
  }, [open, booking]);

  // Update startTime when time components change
  const handleTimeComponentChange = (
    component: "hour" | "minute" | "period",
    value: string
  ) => {
    const newTimeComponents = { ...startTimeComponents, [component]: value };
    setStartTimeComponents(newTimeComponents);

    // Update the actual startTime
    const newStartTime = formatTime(
      newTimeComponents.hour,
      newTimeComponents.minute,
      newTimeComponents.period
    );
    setStartTime(newStartTime);

    // Calculate and update end time
    setEndTime(calculateEndTime(newStartTime));
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
      void e;
      return "";
    }
  };

  const handleConfirm = () => {
    if (!date || !startTime) {
      alert("Please select both date and time");
      return;
    }

    // Update message with actual new date and time
    const updatedMessage = message
      .replace("[NEW DATE]", formatDate(date))
      .replace("[NEW TIME]", startTime);

    onConfirm(date, startTime, endTime, updatedMessage);
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"];

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Session Time</DialogTitle>
          <DialogDescription>
            Update the date and time for this session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Current Session Details</Label>
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
            <Label>New Session Time</Label>
            <div className="grid gap-4">
              {/* Date selector */}
              <div>
                <Label className="mb-1 block">Session Date</Label>
                <Input
                  type="date"
                  id="editDate"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Start Time */}
              <div>
                <Label className="mb-1 block">Start Time</Label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={startTimeComponents.hour}
                    onValueChange={(value) =>
                      handleTimeComponentChange("hour", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map((hour) => (
                        <SelectItem key={`start-hour-${hour}`} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="flex items-center">:</span>

                  <Select
                    value={startTimeComponents.minute}
                    onValueChange={(value) =>
                      handleTimeComponentChange("minute", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {minuteOptions.map((minute) => (
                        <SelectItem
                          key={`start-minute-${minute}`}
                          value={minute}
                        >
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={startTimeComponents.period}
                    onValueChange={(value) =>
                      handleTimeComponentChange("period", value)
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
                  {endTime || "--:--"}
                </div>
              </div>
            </div>
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
          <Button onClick={handleConfirm}>Update Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
