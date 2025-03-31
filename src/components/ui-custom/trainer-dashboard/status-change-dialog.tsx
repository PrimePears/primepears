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
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  booking,
  status,
  onConfirm,
}: StatusChangeDialogProps) {
  const [message, setMessage] = useState("");

  if (!booking) return null;

  const getDefaultMessage = () => {
    const sessionDate = formatDate(booking.date);
    const sessionTime = `${booking.startTime} - ${booking.endTime}`;

    if (status === "CONFIRMED") {
      return `Hi ${booking.client.name},\n\nI'm confirming our session on ${sessionDate} at ${sessionTime}. Looking forward to seeing you!\n\nPlease let me know if you have any questions before we meet.`;
    } else if (status === "CANCELLED") {
      return `Hi ${booking.client.name},\n\nI need to cancel our session scheduled for ${sessionDate} at ${sessionTime}. I apologize for any inconvenience this may cause.\n\nPlease let me know if you'd like to reschedule for another time.`;
    }
    return "";
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setMessage(getDefaultMessage());
    }
    onOpenChange(open);
  };

  const handleConfirm = () => {
    onConfirm(message);
  };

  const getDialogTitle = () => {
    if (status === "CONFIRMED") return "Confirm Session";
    if (status === "CANCELLED") return "Cancel Session";
    return "Update Session Status";
  };

  const getDialogDescription = () => {
    if (status === "CONFIRMED")
      return "Send a confirmation message to your client.";
    if (status === "CANCELLED")
      return "Let your client know why you're cancelling this session.";
    return "Update the status of this session.";
  };

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
          <div className="grid gap-2">
            <Label htmlFor="session">Session Details</Label>
            <div className="rounded-md border p-2 bg-muted/50">
              {formatDate(booking.date)} • {booking.startTime} -{" "}
              {booking.endTime}
            </div>
          </div>
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
              ? "Confirm & Send"
              : status === "CANCELLED"
                ? "Cancel & Send"
                : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
