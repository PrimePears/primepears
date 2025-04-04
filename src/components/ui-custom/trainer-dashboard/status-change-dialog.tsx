"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/data/data";

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
};

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  status: string;
  onConfirm: (message: string) => void;
  onConfirmWithEdit?: (
    message: string,
    date: string,
    startTime: string
  ) => void;
  onCancel?: (message: string) => void; // Add this new prop
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  booking,
  status,
  onConfirm,
  onConfirmWithEdit,
  onCancel,
}: StatusChangeDialogProps) {
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState("");

  const [originalDate, setOriginalDate] = useState("");
  const [originalStartTime, setOriginalStartTime] = useState("");
  const [originalEndTime, setOriginalEndTime] = useState("");

  // Time state with separate hour, minute, and period
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [startPeriod, setStartPeriod] = useState("AM");

  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [endPeriod, setEndPeriod] = useState("AM");

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

  useEffect(() => {
    if (open && booking) {
      setMessage(getDefaultMessage());
      setEditDate(booking.date);

      // Store original values
      setOriginalDate(booking.date);
      setOriginalStartTime(booking.startTime);
      setOriginalEndTime(booking.endTime);

      // Parse start time
      const startTimeParts = parseTime(booking.startTime);
      setStartHour(startTimeParts.hour);
      setStartMinute(startTimeParts.minute);
      setStartPeriod(startTimeParts.period);

      // Parse end time
      const endTimeParts = parseTime(booking.endTime);
      setEndHour(endTimeParts.hour);
      setEndMinute(endTimeParts.minute);
      setEndPeriod(endTimeParts.period);

      setEditMode(false);
    }
  }, [open, booking]);

  // Update end time when start time changes
  useEffect(() => {
    if (booking && booking.sessionType) {
      // Convert to 24-hour format for calculation
      let hours = Number.parseInt(startHour);
      const minutes = Number.parseInt(startMinute);

      // Convert to 24-hour format
      if (startPeriod === "PM" && hours < 12) hours += 12;
      if (startPeriod === "AM" && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      // Add duration based on session type
      if (booking.sessionType === "CONSULTATION") {
        date.setMinutes(date.getMinutes() + 15);
      } else {
        date.setHours(date.getHours() + 1); // Default to 1 hour for other session types
      }

      // Convert back to 12-hour format
      let endHours = date.getHours();
      const endMinutes = date.getMinutes();
      const endPeriod = endHours >= 12 ? "PM" : "AM";

      if (endHours > 12) endHours -= 12;
      if (endHours === 0) endHours = 12;

      setEndHour(endHours.toString());
      setEndMinute(endMinutes.toString().padStart(2, "0"));
      setEndPeriod(endPeriod);
    }
  }, [startHour, startMinute, startPeriod, booking]);

  const getDefaultMessage = () => {
    if (!booking) return "";

    const sessionDate = formatDate(booking.date);
    const sessionTime = `${booking.startTime} - ${booking.endTime}`;

    if (status === "CONFIRMED") {
      return `Hi ${booking.client.name},\n\nI'm confirming our session on ${sessionDate} at ${sessionTime}. Looking forward to seeing you!\n\nPlease let me know if you have any questions before we meet.`;
    } else if (status === "CANCELLED") {
      return `Hi ${booking.client.name},\n\nI am not able to schedule our ${sessionDate} at ${sessionTime}. I apologize for any inconvenience this may cause.\n\nPlease let me know if you'd like to reschedule for another time.`;
    }
    return "";
  };

  const handleOpenChange = (open: boolean) => {
    if (open && booking) {
      setMessage(getDefaultMessage());
      setEditDate(booking.date);

      // Parse start time
      const startTimeParts = parseTime(booking.startTime);
      setStartHour(startTimeParts.hour);
      setStartMinute(startTimeParts.minute);
      setStartPeriod(startTimeParts.period);

      // Parse end time
      const endTimeParts = parseTime(booking.endTime);
      setEndHour(endTimeParts.hour);
      setEndMinute(endTimeParts.minute);
      setEndPeriod(endTimeParts.period);

      setEditMode(false);
    }
    onOpenChange(open);
  };

  const handleConfirm = () => {
    if (status === "CONFIRMED" && editMode && onConfirmWithEdit) {
      const formattedStartTime = formatTime(
        startHour,
        startMinute,
        startPeriod
      );
      onConfirmWithEdit(message, editDate, formattedStartTime);
    } else if (status === "CANCELLED" && onCancel) {
      onCancel(message);
    } else {
      onConfirm(message);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const getDialogTitle = () => {
    if (status === "CONFIRMED")
      return editMode ? "Edit & Confirm Session" : "Confirm Session";
    if (status === "CANCELLED") return "Cancel Session";
    return "Update Session Status";
  };

  const getDialogDescription = () => {
    if (status === "CONFIRMED") {
      return editMode
        ? "Edit the session details and send a confirmation message to your client."
        : "Send a confirmation message to your client.";
    }
    if (status === "CANCELLED")
      return "Let your client know why you're cancelling this session.";
    return "Update the status of this session.";
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // Generate minute options (00-59)
  const minuteOptions = ["0", "15", "30", "45"];
  // Array.from({ length: 60 }, (_, i) =>
  //   i.toString().padStart(2, "0")
  // );

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <div className="rounded-md border p-2 bg-muted/50">
              {booking.client.name}
            </div>
          </div>

          {editMode && (
            <div className="p-3 border border-dashed rounded-md bg-muted/30">
              <h4 className="text-sm font-medium mb-2">Original Date & Time</h4>
              <div className="text-sm text-muted-foreground">
                {formatDate(originalDate)} • {originalStartTime} -{" "}
                {originalEndTime}
              </div>
            </div>
          )}

          {status === "CONFIRMED" && !editMode ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="session">Session Details</Label>
                <div className="rounded-md border p-2 bg-muted/50">
                  {formatDate(booking.date)} • {booking.startTime} -{" "}
                  {booking.endTime}
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={toggleEditMode}
                className="w-full"
              >
                Edit Date/Time
              </Button>
            </>
          ) : status === "CONFIRMED" && editMode ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="editDate">Session Date</Label>
                <Input
                  type="date"
                  id="editDate"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid gap-2">
                <Label>Start Time</Label>
                <div className="flex gap-2">
                  <Select value={startHour} onValueChange={setStartHour}>
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

                  <Select value={startMinute} onValueChange={setStartMinute}>
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

                  <Select value={startPeriod} onValueChange={setStartPeriod}>
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

              <div className="grid gap-2">
                <Label>End Time (Preview)</Label>
                <div className="rounded-md border p-2 bg-muted/50">
                  {formatTime(endHour, endMinute, endPeriod)}
                </div>
                <p className="text-xs text-muted-foreground">
                  End time will be calculated automatically based on session
                  duration
                </p>
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={toggleEditMode}
                className="w-full"
              >
                Cancel Edit
              </Button>
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="session">Session Details</Label>
              <div className="rounded-md border p-2 bg-muted/50">
                {formatDate(booking.date)} • {booking.startTime} -{" "}
                {booking.endTime}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="message">Message to Client</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message to the client..."
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {status === "CONFIRMED"
              ? editMode
                ? "Save Changes & Confirm"
                : "Confirm & Send"
              : status === "CANCELLED"
                ? "Cancel & Send"
                : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
