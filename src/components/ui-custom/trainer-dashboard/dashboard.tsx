"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  History,
  MoreHorizontal,
} from "lucide-react";
import { formatDate, formatSessionType } from "@/lib/data/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { InvoiceModal } from "./invoice-modal";
import { StatusChangeDialog } from "./status-change-dialog";
import { AlternateTimesDialog } from "./alternate-times-dialog";

// Define the booking type based on your schema
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

type BookingsData = {
  pending: Booking[];
  confirmed: Booking[];
  completed: Booking[];
  cancelled: Booking[];
  all: Booking[];
};

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingsData, setBookingsData] = useState<BookingsData>({
    pending: [],
    confirmed: [],
    completed: [],
    cancelled: [],
    all: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [alternateTimesDialogOpen, setAlternateTimesDialogOpen] =
    useState(false);
  const [targetStatus, setTargetStatus] = useState<string>("");

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookingsData(data);
    } catch (error) {
      toast("Failed to load your sessions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    setSelectedBooking(booking);

    // Special handling for proposing alternate times
    if (newStatus === "PROPOSE_ALTERNATES") {
      setAlternateTimesDialogOpen(true);
      return;
    }

    // For CONFIRMED or CANCELLED, show dialog to send message
    if (newStatus === "CONFIRMED" || newStatus === "CANCELLED") {
      setTargetStatus(newStatus);
      setStatusDialogOpen(true);
    } else {
      // For other statuses, just update without message
      await updateBookingStatus(booking.id, newStatus);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: string,
    message?: string
  ) => {
    try {
      const response = await fetch(`/api/dashboard/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      toast(`Session ${newStatus.toLowerCase()} successfully`);

      // Refresh bookings data
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast("Failed to update session status. Please try again.");
    }
  };

  const handleSendAlternativeTimes = async (
    message: string,
    alternativeTimes: Array<{
      date: string;
      startTime: string;
      endTime: string;
    }>
  ) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(
        `/api/dashboard/${selectedBooking.id}/propose-alternates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            alternativeTimes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send alternative times");
      }

      toast("Alternative times proposed successfully");

      setAlternateTimesDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error("Error proposing alternative times:", error);
      toast("Failed to propose alternative times. Please try again.");
    }
  };

  const handleDialogConfirm = async (message: string) => {
    if (selectedBooking && targetStatus) {
      await updateBookingStatus(selectedBooking.id, targetStatus, message);
      setStatusDialogOpen(false);
      setSelectedBooking(null);
      setTargetStatus("");
    }
  };

  // Helper component for session cards
  const SessionCard = ({ booking }: { booking: Booking }) => {
    const getStatusOptions = (currentStatus: string) => {
      switch (currentStatus) {
        case "PENDING":
          return [
            { label: "Confirm", value: "CONFIRMED" },
            { label: "Propose Alternate Times", value: "PROPOSE_ALTERNATES" },
            { label: "Cancel", value: "CANCELLED" },
          ];
        case "CONFIRMED":
          return [
            { label: "Mark as Completed", value: "COMPLETED" },
            { label: "Cancel", value: "CANCELLED" },
            { label: "Mark as No-Show", value: "NO_SHOW" },
          ];
        case "CANCELLED":
          return [{ label: "Reactivate as Pending", value: "PENDING" }];
        case "COMPLETED":
          return []; // No status changes for completed sessions
        case "NO_SHOW":
          return [{ label: "Reschedule as Pending", value: "PENDING" }];
        default:
          return [];
      }
    };

    const statusOptions = getStatusOptions(booking.status);

    return (
      <div
        key={booking.id}
        className="flex items-center justify-between rounded-lg border p-3"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{booking.client.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatSessionType(booking.sessionType)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{formatDate(booking.date)}</p>
            <p className="text-sm text-muted-foreground">
              {booking.startTime} - {booking.endTime}
            </p>
          </div>

          {statusOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatusChange(booking, option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  // Loading component
  const LoadingState = () => (
    <div className="flex justify-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  // Empty state component
  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-6 text-muted-foreground">{message}</div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Trainer Dashboard</h1>
          <div className="flex">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex gap-2 ml-4 px-4 py-2 bg-custom-button-green hover:bg-custom-button-hover-green text-white rounded"
            >
              Create Invoice
            </button>
            <Link href="/trainer-profile/edit/${user?.id}">
              <button className="flex gap-2 ml-4 px-4 py-2 bg-custom-button-green hover:bg-custom-button-hover-green text-white rounded">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookingsData.all.length}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookingsData.pending.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookingsData.confirmed.length}
              </div>
              <p className="text-xs text-muted-foreground">Ready to go</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(bookingsData.all.map((booking) => booking.clientId))
                    .size
                }
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions Section */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Pending Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Pending Sessions
              </CardTitle>
              <CardDescription>
                Sessions awaiting your confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState />
              ) : bookingsData.pending.length === 0 ? (
                <EmptyState message="No pending sessions" />
              ) : (
                <div className="space-y-4">
                  {bookingsData.pending.map((booking) => (
                    <SessionCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Confirmed Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Confirmed Sessions
              </CardTitle>
              <CardDescription>
                Your upcoming confirmed sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState />
              ) : bookingsData.confirmed.length === 0 ? (
                <EmptyState message="No confirmed sessions" />
              ) : (
                <div className="space-y-4">
                  {bookingsData.confirmed.map((booking) => (
                    <SessionCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Session History
              </CardTitle>
              <CardDescription>Past and cancelled sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState />
              ) : (
                <Tabs defaultValue="completed">
                  <TabsList className="mb-4">
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  </TabsList>

                  <TabsContent value="completed">
                    {bookingsData.completed.length === 0 ? (
                      <EmptyState message="No completed sessions" />
                    ) : (
                      <div className="space-y-4">
                        {bookingsData.completed.map((booking) => (
                          <SessionCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="cancelled">
                    {bookingsData.cancelled.length === 0 ? (
                      <EmptyState message="No cancelled sessions" />
                    ) : (
                      <div className="space-y-4">
                        {bookingsData.cancelled.map((booking) => (
                          <SessionCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        booking={selectedBooking}
        status={targetStatus}
        onConfirm={handleDialogConfirm}
      />

      <AlternateTimesDialog
        open={alternateTimesDialogOpen}
        onOpenChange={setAlternateTimesDialogOpen}
        booking={selectedBooking}
        onConfirm={handleSendAlternativeTimes}
      />
    </div>
  );
}
