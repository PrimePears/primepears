"use client";

import type React from "react";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createBooking } from "@/lib/actions/booking";
import { SessionType, SessionDuration } from "@prisma/client";
import { useAuth, useUser } from "@clerk/nextjs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  sendBookingConfirmationEmails,
  sendBookingConfirmationEmailsNoAccount,
} from "@/lib/actions/session-booking-emails";
import { Input } from "@/components/ui/input";
import { date } from "zod";
import { TimePicker } from "@/components/ui-custom/time-picker/time-picker";

// interface TimePickerProps {
//   value: string;
//   onChange: (value: string) => void;
//   minTime?: string; // Format: "HH:MM AM/PM"
// }

// function TimePicker({ value, onChange, minTime }: TimePickerProps) {
//   // Parse the current value
//   const [hour, setHour] = useState<string>("");
//   const [minute, setMinute] = useState<string>("");
//   const [period, setPeriod] = useState<string>("");
//   const [isInitialized, setIsInitialized] = useState(false);

//   // Generate available hours (1-12)
//   const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));

//   // Generate available minutes (00, 15, 30, 45)
//   const minutes = ["00", "15", "30", "45"];

//   // Parse minTime if provided
//   const minHour = minTime ? Number.parseInt(minTime.split(":")[0]) : 0;
//   const minMinute = minTime
//     ? Number.parseInt(minTime.split(":")[1].split(" ")[0])
//     : 0;
//   const minPeriod = minTime ? minTime.split(" ")[1] : "AM";

//   // Initialize from value prop - only once
//   useEffect(() => {
//     if (value && !isInitialized) {
//       const timeParts = value.split(" ");
//       if (timeParts.length === 2) {
//         const [hourMinute, ampm] = timeParts;
//         const [h, m] = hourMinute.split(":");
//         setHour(h);
//         setMinute(m);
//         setPeriod(ampm);
//         setIsInitialized(true);
//       } else if (!hour) {
//         // Set default values if no value is provided
//         setHour("9");
//         setMinute("00");
//         setPeriod("AM");
//         setIsInitialized(true);
//       }
//     }
//   }, [value, isInitialized, hour]);

//   // Handle individual field changes
//   const handleHourChange = (newHour: string) => {
//     setHour(newHour);
//     if (minute && period) {
//       onChange(`${newHour}:${minute} ${period}`);
//     }
//   };

//   const handleMinuteChange = (newMinute: string) => {
//     setMinute(newMinute);
//     if (hour && period) {
//       onChange(`${hour}:${newMinute} ${period}`);
//     }
//   };

//   const handlePeriodChange = (newPeriod: string) => {
//     setPeriod(newPeriod);
//     if (hour && minute) {
//       onChange(`${hour}:${minute} ${newPeriod}`);
//     }
//   };

//   // Check if a specific time option should be disabled
//   const isTimeDisabled = (h: string, m: string, p: string): boolean => {
//     if (!minTime) return false;

//     // Convert to 24-hour for easier comparison
//     const selectedHour = Number.parseInt(h);
//     const selectedMinute = Number.parseInt(m);
//     const selectedPeriod = p;

//     // Convert to comparable values
//     const selected24Hour =
//       selectedPeriod === "PM" && selectedHour !== 12
//         ? selectedHour + 12
//         : selectedPeriod === "AM" && selectedHour === 12
//           ? 0
//           : selectedHour;

//     const min24Hour =
//       minPeriod === "PM" && minHour !== 12
//         ? minHour + 12
//         : minPeriod === "AM" && minHour === 12
//           ? 0
//           : minHour;

//     // Compare
//     if (selected24Hour < min24Hour) return true;
//     if (selected24Hour === min24Hour && selectedMinute < minMinute) return true;

//     return false;
//   };

//   return (
//     <div className="flex space-x-2">
//       <Select value={hour} onValueChange={handleHourChange}>
//         <SelectTrigger className="w-[80px]">
//           <SelectValue placeholder="Hour" />
//         </SelectTrigger>
//         <SelectContent>
//           {hours.map((h) => (
//             <SelectItem
//               key={h}
//               value={h}
//               disabled={isTimeDisabled(h, minute, period)}
//             >
//               {h}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Select value={minute} onValueChange={handleMinuteChange}>
//         <SelectTrigger className="w-[80px]">
//           <SelectValue placeholder="Min" />
//         </SelectTrigger>
//         <SelectContent>
//           {minutes.map((m) => (
//             <SelectItem
//               key={m}
//               value={m}
//               disabled={isTimeDisabled(hour, m, period)}
//             >
//               {m}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Select value={period} onValueChange={handlePeriodChange}>
//         <SelectTrigger className="w-[80px]">
//           <SelectValue placeholder="AM/PM" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="AM" disabled={isTimeDisabled(hour, minute, "AM")}>
//             AM
//           </SelectItem>
//           <SelectItem value="PM" disabled={isTimeDisabled(hour, minute, "PM")}>
//             PM
//           </SelectItem>
//         </SelectContent>
//       </Select>
//     </div>
//   );
// }

interface BookingButtonsProps {
  trainerName: string;
  trainerId: string;
  clientId?: string;
}

export default function BookingButtons({
  trainerName,
  trainerId,
  clientId,
}: BookingButtonsProps) {
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // const { toast } = useToast();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  /* eslint-disable */
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [minTime, setMinTime] = useState<string | undefined>(undefined);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Form states
  const [consultationForm, setConsultationForm] = useState({
    date: "",
    time: "",
    notes: "",
  });

  const [sessionForm, setSessionForm] = useState({
    sessionType: "60min",
    date: "",
    time: "",
    notes: "",
  });

  // Guest user information
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
  });

  const [consultationDate, setConsultationDate] = useState<Date | undefined>(
    undefined
  );
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);

  // Update minimum time when date changes
  useEffect(() => {
    if (consultationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(consultationDate);
      selectedDay.setHours(0, 0, 0, 0);

      if (selectedDay.getTime() === today.getTime()) {
        // If today is selected, set minimum time to current time rounded up to next 15 min
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const roundedMinute = Math.ceil(minute / 15) * 15;

        let displayHour = hour;
        let displayMinute = roundedMinute;
        let period = "AM";

        // Handle minute overflow
        if (displayMinute >= 60) {
          displayHour += 1;
          displayMinute = 0;
        }

        // Convert to 12-hour format
        if (displayHour >= 12) {
          period = "PM";
          if (displayHour > 12) {
            displayHour -= 12;
          }
        } else if (displayHour === 0) {
          displayHour = 12;
        }

        setMinTime(
          `${displayHour}:${displayMinute.toString().padStart(2, "0")} ${period}`
        );
      } else {
        setMinTime(undefined);
      }
    } else {
      setMinTime(undefined);
    }
  }, [consultationDate]);

  // Same for session date
  useEffect(() => {
    if (sessionDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(sessionDate);
      selectedDay.setHours(0, 0, 0, 0);

      if (selectedDay.getTime() === today.getTime()) {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const roundedMinute = Math.ceil(minute / 15) * 15;

        let displayHour = hour;
        let displayMinute = roundedMinute;
        let period = "AM";

        if (displayMinute >= 60) {
          displayHour += 1;
          displayMinute = 0;
        }

        if (displayHour >= 12) {
          period = "PM";
          if (displayHour > 12) {
            displayHour -= 12;
          }
        } else if (displayHour === 0) {
          displayHour = 12;
        }

        setMinTime(
          `${displayHour}:${displayMinute.toString().padStart(2, "0")} ${period}`
        );
      } else {
        setMinTime(undefined);
      }
    } else {
      setMinTime(undefined);
    }
  }, [sessionDate]);

  // Handle consultation form changes
  const handleConsultationChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setConsultationForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle session form changes
  const handleSessionChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSessionForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle guest info changes
  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle consultation booking
  const handleConsultationSubmit = () => {
    if (!consultationForm.date || !consultationForm.time) {
      toast("Please select both a date and time for your consultation.");
      return;
    }

    if (!isSignedIn) {
      // Validate guest information
      if (!guestInfo.name || !guestInfo.email) {
        toast("Please provide your name and email address.");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestInfo.email)) {
        toast("Please provide a valid email address.");
        return;
      }

      // Handle guest booking
      startTransition(async () => {
        // Here you would implement your guest booking logic
        // For example, you might want to create a temporary user or store the booking differently

        toast(
          "Your consultation request has been received. We'll contact you shortly to confirm."
        );

        try {
          const emailResult = await sendBookingConfirmationEmailsNoAccount({
            trainerId,
            trainerName,
            clientName: guestInfo.name,
            clientEmail: guestInfo.email,
            sessionType: SessionType.CONSULTATION,
            date: consultationForm.date,
            time: consultationForm.time,
            notes: consultationForm.notes,
          });

          if (emailResult.success) {
            toast("Confirmation emails have been sent to you and the trainer.");
          }
          // You might want to send a different type of email for guest users
          // This is a placeholder for your implementation
          // console.log("Guest booking:", {
          //   name: guestInfo.name,
          //   email: guestInfo.email,
          //   date: consultationForm.date,
          //   time: consultationForm.time,
          //   notes: consultationForm.notes,
          // });
        } catch (error) {
          console.log("Error processing guest consultation request");
          console.log(error);
        }

        setConsultationOpen(false);
        setConsultationForm({ date: "", time: "", notes: "" });
        setGuestInfo({ name: "", email: "" });
        setConsultationDate(undefined);
      });

      return;
    }

    const effectiveClientId = clientId || user?.id;

    if (!effectiveClientId) {
      toast("Unable to identify user. Please try again or contact support.");
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        trainerId,
        clientId: effectiveClientId,
        sessionType: SessionType.CONSULTATION,
        duration: SessionDuration.MINUTES_15,
        date: consultationForm.date,
        startTime: consultationForm.time,
        notes: consultationForm.notes,
      });

      if (result.success) {
        toast(
          "Your 15-minute consultation with has been scheduled. A meeting confirmation will be sent when the trainer approves."
        );
        console.log(sessionForm.date);

        try {
          const emailResult = await sendBookingConfirmationEmails({
            trainerId,
            clientId: effectiveClientId,
            trainerName,
            clientName: user?.fullName || "Client",
            sessionType: SessionType.CONSULTATION,
            date: consultationForm.date,
            time: consultationForm.time,
            notes: consultationForm.notes,
          });

          if (emailResult.success) {
            toast("Scheduling emails have been sent to you and the trainer.");
          }
        } catch (error) {
          console.log("Error sending confirmation emails");
          console.log(error);
        }

        setConsultationOpen(false);
        setConsultationForm({ date: "", time: "", notes: "" });
        setConsultationDate(undefined);
      } else {
        toast("Something went wrong. Please try again.");
      }
    });
  };

  // Handle session booking
  const handleSessionSubmit = () => {
    if (!sessionForm.date || !sessionForm.time) {
      toast("Please select both a date and time for your session.");
      return;
    }

    if (!isSignedIn) {
      toast("Please sign in to book a session.");
      router.push("/sign-in");
      return;
    }

    const effectiveClientId = clientId || user?.id;

    if (!effectiveClientId) {
      toast("Unable to identify user. Please try again or contact support.");
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        trainerId,
        clientId: effectiveClientId,
        sessionType: SessionType.FULL_SESSION,
        duration:
          sessionForm.sessionType === "60min"
            ? SessionDuration.MINUTES_60
            : SessionDuration.MINUTES_90,
        date: sessionForm.date,
        startTime: sessionForm.time,
        notes: sessionForm.notes,
      });

      if (result.success) {
        toast(
          `Your ${sessionForm.sessionType === "60min" ? "60" : "90"}-minute session with ${trainerName} has been scheduled.`
        );

        try {
          const emailResult = await sendBookingConfirmationEmails({
            trainerId,
            clientId: effectiveClientId,
            trainerName,
            clientName: user?.fullName || "Client",
            sessionType:
              sessionForm.sessionType === "60min" ? "60-minute" : "90-minute",
            date: sessionForm.date,
            time: sessionForm.time,
            notes: sessionForm.notes,
          });

          if (emailResult.success) {
            toast("Confirmation emails have been sent to you and the trainer.");
          }
        } catch (error) {
          console.log("Error sending confirmation emails");
          console.log(error);
        }
        setSessionOpen(false);
        setSessionForm({ sessionType: "60min", date: "", time: "", notes: "" });
        setSessionDate(undefined);
      } else {
        toast("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center mx-auto w-[95%] sm:w-[90%] md:w-4/5">
      <div className="ml-auto flex justify-center items-center ">
        <div className="flex flex-col items-center justify-center gap-4 w-full">
          <Dialog open={consultationOpen} onOpenChange={setConsultationOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="w-full sm:w-[220px] h-12 bg-custom-button-green hover:bg-custom-button-hover-green text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                Free 15-Minute Consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 border-r border-border">
                  <DialogHeader className="pb-4">
                    <DialogTitle>Book a Free Consultation</DialogTitle>
                    <DialogDescription>
                      Schedule a 15-minute call with {trainerName} to discuss
                      your fitness goals.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    {!isSignedIn && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="guest-name">Your Name</Label>
                          <Input
                            id="guest-name"
                            name="name"
                            value={guestInfo.name}
                            onChange={handleGuestInfoChange}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="guest-email">Email Address</Label>
                          <Input
                            id="guest-email"
                            name="email"
                            type="email"
                            value={guestInfo.email}
                            onChange={handleGuestInfoChange}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="consultation-time">Select a time</Label>
                      <TimePicker
                        value={consultationForm.time}
                        onChange={(value) =>
                          setConsultationForm((prev) => ({
                            ...prev,
                            time: value,
                          }))
                        }
                        minTime={minTime}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="consultation-notes">
                        Notes (optional)
                      </Label>
                      <Textarea
                        id="consultation-notes"
                        name="notes"
                        value={consultationForm.notes}
                        onChange={handleConsultationChange}
                        placeholder="Tell us about your fitness goals or any questions you have"
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 bg-muted/20">
                  <div className="mb-4">
                    <Label htmlFor="consultation-date" className="mb-2 block">
                      Select a date
                    </Label>
                    <Calendar
                      mode="single"
                      selected={consultationDate}
                      onSelect={(date) => {
                        setConsultationDate(date);
                        if (date) {
                          const formattedDate = date
                            .toISOString()
                            .split("T")[0];
                          setConsultationForm((prev) => ({
                            ...prev,
                            date: formattedDate,
                          }));
                        }
                      }}
                      disabled={(date) => {
                        // Disable dates in the past
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="mx-auto bg-background border rounded-md p-3"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center p-4 bg-muted/10 border-t">
                <Button
                  type="button"
                  onClick={handleConsultationSubmit}
                  disabled={isPending}
                  className="w-full md:w-1/3"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Consultation"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="w-full sm:w-[220px] h-12 bg-custom-button-green hover:bg-custom-button-hover-green text-white"
                onClick={(e) => {
                  if (!isSignedIn) {
                    e.preventDefault();
                    router.push("/sign-up");
                    toast(
                      "Please create an account or sign in to book a session."
                    );
                  }
                }}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Book a Full Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 border-r border-border">
                  <DialogHeader className="pb-4">
                    <DialogTitle>Book a Training Session</DialogTitle>
                    <DialogDescription>
                      Schedule a full training session with {trainerName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label>Session Type</Label>
                      <RadioGroup
                        defaultValue="60min"
                        value={sessionForm.sessionType}
                        onValueChange={(value) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            sessionType: value,
                          }))
                        }
                        className="space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="60min" id="60min" />
                          <Label htmlFor="60min">60-Minute Session ($75)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="90min" id="90min" />
                          <Label htmlFor="90min">
                            90-Minute Session ($110)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="session-time">Select a time</Label>
                      <TimePicker
                        value={sessionForm.time}
                        onChange={(value) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            time: value,
                          }))
                        }
                        minTime={minTime}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="session-notes">Notes (optional)</Label>
                      <Textarea
                        id="session-notes"
                        name="notes"
                        value={sessionForm.notes}
                        onChange={handleSessionChange}
                        placeholder="Any specific areas you'd like to focus on?"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 bg-muted/20">
                  <div className="mb-4">
                    <Label htmlFor="session-date" className="mb-2 block">
                      Select a date
                    </Label>
                    <Calendar
                      mode="single"
                      selected={sessionDate}
                      onSelect={(date) => {
                        setSessionDate(date);
                        if (date) {
                          const formattedDate = date
                            .toISOString()
                            .split("T")[0];
                          setSessionForm((prev) => ({
                            ...prev,
                            date: formattedDate,
                          }));
                        }
                      }}
                      disabled={(date) => {
                        // Disable dates in the past
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="mx-auto bg-background border rounded-md p-3"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center p-4 bg-muted/10 border-t">
                <Button
                  type="button"
                  onClick={handleSessionSubmit}
                  disabled={isPending}
                  className="w-full md:w-1/3"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Session"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
