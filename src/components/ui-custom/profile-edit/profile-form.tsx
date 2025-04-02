"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import {
//   CreateProfileFormSchema,
//   type SocialMediaLink as SocialMediaLinkType,
// } from "@/schemas/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  X,
  PlusCircle,
  Clock,
  Trash2,
  LinkIcon,
  HelpCircle,
  InfoIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AvailabilityCard from "./availability-card";
import type { Certification, DayAvailability, Profile } from "@/lib/data/data";
import {
  CreateProfileFormSchema,
  type SocialMediaLink as SocialMediaLinkType,
} from "@/app/schemas/profile";
import { SocialMediaHelpDialog } from "./social-media-help-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the availability slot interface
interface AvailabilitySlot {
  day: string;
  timeRanges: string[];
}

interface AvailabilitySchedulerProps {
  certificationProp: Certification[];
  availabilitiesProp: DayAvailability[];
  profile: Profile;
}

export default function CreateProfileForm({
  certificationProp = [],
  availabilitiesProp = [],
  profile,
}: AvailabilitySchedulerProps) {
  const [availabilityData, setAvailabilityData] = useState<AvailabilitySlot[]>(
    availabilitiesProp.map((availability) => ({
      day: availability.day,
      timeRanges: availability.timeRanges.map(
        (tr) => `${tr.startTime} - ${tr.endTime}`
      ),
    }))
  );

  const initialAvailabilities: DayAvailability[] = (
    availabilitiesProp || []
  ).map((avail) => {
    return {
      id: crypto.randomUUID(),
      day: avail.day.replace(/s$/, ""), // Remove trailing 's' from day name
      timeRanges: avail.timeRanges.map((tr) => {
        // Otherwise, process the string format
        const start = tr.startTime;
        const end = tr.endTime;
        // Convert from 12h to 24h format for the form
        const convertTo24h = (time12h: string) => {
          const [timePart, modifier] = time12h.split(" ");
          const [hours, minutes] = timePart.split(":");
          let hoursNum = Number.parseInt(hours, 10);

          if (modifier === "PM" && hoursNum < 12) {
            hoursNum += 12;
          }
          if (modifier === "AM" && hoursNum === 12) {
            hoursNum = 0;
          }

          return `${hoursNum.toString().padStart(2, "0")}:${minutes}`;
        };

        return {
          id: crypto.randomUUID(),
          startTime: convertTo24h(start),
          endTime: convertTo24h(end),
        };
      }),
    };
  });

  // If no availabilities, add a default one
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>(
    initialAvailabilities.length > 0
      ? initialAvailabilities
      : [
          {
            id: crypto.randomUUID(),
            day: "Monday",
            timeRanges: [
              { id: crypto.randomUUID(), startTime: "09:00", endTime: "17:00" },
            ],
          },
        ]
  );

  const [certifications, setCertifications] = useState<Certification[]>(
    certificationProp || []
  );
  const [newCertName, setNewCertName] = useState("");

  // Initialize alternate contact state from profile data
  const hasAlternateContact = !!(
    profile.alternateName || profile.alternateEmail
  );
  const [showAlternateContact, setShowAlternateContact] =
    useState(hasAlternateContact);
  const [alternateName, setAlternateName] = useState(
    profile.alternateName || ""
  );
  const [alternateEmail, setAlternateEmail] = useState(
    profile.alternateEmail || ""
  );

  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const openHelpDialog = (platform: string) => {
    setSelectedPlatform(platform);
    setHelpOpen(true);
  };

  // Initialize social media links from profile data
  // const hasSocialMedia = !!(
  //   profile.socialMediaLinks &&
  //   Array.isArray(profile.socialMediaLinks) &&
  //   profile.socialMediaLinks.length > 0
  // );
  // const [showSocialMedia, setShowSocialMedia] = useState(hasSocialMedia);
  const [socialMediaLinks, setSocialMediaLinks] = useState<
    SocialMediaLinkType[]
  >([
    // Initialize from legacy fields if they exist
    ...(profile.twitterLink
      ? [
          {
            id: crypto.randomUUID(),
            platform: "twitter",
            url: profile.twitterLink,
          },
        ]
      : []),
    ...(profile.instagramLink
      ? [
          {
            id: crypto.randomUUID(),
            platform: "instagram",
            url: profile.instagramLink,
          },
        ]
      : []),
    ...(profile.facebookLink
      ? [
          {
            id: crypto.randomUUID(),
            platform: "facebook",
            url: profile.facebookLink,
          },
        ]
      : []),
    ...(profile.youtubeLink
      ? [
          {
            id: crypto.randomUUID(),
            platform: "youtube",
            url: profile.youtubeLink,
          },
        ]
      : []),
  ]);

  // Initialize trainer type from profile data
  const [trainerType, setTrainerType] = useState(
    profile.trainerType || "strength"
  );

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const form = useForm<z.infer<typeof CreateProfileFormSchema>>({
    resolver: zodResolver(CreateProfileFormSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      location: profile.location ?? "",
      // level: profile.level,
      rate: profile.rate,
      bio: profile.bio ?? "",
      experience: profile.experience ?? "",
      videoUrl: profile.videoUrl ?? "",
      trainerType: profile.trainerType || "strength",
    },
  });

  // Availability form functions
  const addDay = () => {
    const unusedDays = days.filter(
      (day) => !availabilities.some((avail) => avail.day === day)
    );

    if (unusedDays.length === 0) return;

    setAvailabilities([
      ...availabilities,
      {
        id: crypto.randomUUID(),
        day: unusedDays[0],
        timeRanges: [
          { id: crypto.randomUUID(), startTime: "09:00", endTime: "17:00" },
        ],
      },
    ]);
  };

  const removeDay = (dayId: string) => {
    setAvailabilities(availabilities.filter((day) => day.id !== dayId));
  };

  const addTimeRange = (dayId: string) => {
    setAvailabilities(
      availabilities.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            timeRanges: [
              ...day.timeRanges,
              { id: crypto.randomUUID(), startTime: "09:00", endTime: "17:00" },
            ],
          };
        }
        return day;
      })
    );
  };

  const removeTimeRange = (dayId: string, timeRangeId: string) => {
    setAvailabilities(
      availabilities.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            timeRanges: day.timeRanges.filter((tr) => tr.id !== timeRangeId),
          };
        }
        return day;
      })
    );
  };

  const updateDay = (dayId: string, newDay: string) => {
    setAvailabilities(
      availabilities.map((day) => {
        if (day.id === dayId) {
          return { ...day, day: newDay };
        }
        return day;
      })
    );
  };

  const updateTimeRange = (
    dayId: string,
    timeRangeId: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailabilities(
      availabilities.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            timeRanges: day.timeRanges.map((tr) => {
              if (tr.id === timeRangeId) {
                return { ...tr, [field]: value };
              }
              return tr;
            }),
          };
        }
        return day;
      })
    );
  };

  // Format time from 24h to 12h format
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Update availability data when form changes
  const updateAvailabilityData = () => {
    const formattedData = availabilities.map((avail) => ({
      day: avail.day + "s", // Add 's' to make it plural like "Mondays"
      timeRanges: avail.timeRanges.map(
        (tr) => `${formatTime(tr.startTime)} - ${formatTime(tr.endTime)}`
      ),
    }));

    setAvailabilityData(formattedData);
  };

  const addCertification = () => {
    if (!newCertName.trim()) return;

    if (certifications.length >= 4) {
      toast.error("You can only add up to 4 certifications");
      return;
    }

    const newCert = {
      id: crypto.randomUUID(),
      name: newCertName.trim(),
    };

    setCertifications([...certifications, newCert]);
    setNewCertName("");
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter((cert) => cert.id !== id));
  };

  // Function to add a new social media link
  const addSocialMediaLink = () => {
    setSocialMediaLinks([
      ...socialMediaLinks,
      {
        id: crypto.randomUUID(),
        platform: "",
        url: "",
      },
    ]);
  };

  // Function to remove a social media link
  const removeSocialMediaLink = (id: string) => {
    setSocialMediaLinks(socialMediaLinks.filter((link) => link.id !== id));
  };

  // Function to update a social media link
  const updateSocialMediaLink = (
    id: string,
    field: "platform" | "url",
    value: string
  ) => {
    setSocialMediaLinks(
      socialMediaLinks.map((link) => {
        if (link.id === id) {
          return { ...link, [field]: value };
        }
        return link;
      })
    );
  };

  async function onSubmit(values: z.infer<typeof CreateProfileFormSchema>) {
    try {
      // Update availability data before submission
      updateAvailabilityData();

      // Map social media links to both formats
      const twitterLink =
        socialMediaLinks.find((link) => link.platform === "twitter")?.url ||
        null;
      const instagramLink =
        socialMediaLinks.find((link) => link.platform === "instagram")?.url ||
        null;
      const facebookLink =
        socialMediaLinks.find((link) => link.platform === "facebook")?.url ||
        null;
      const youtubeLink =
        socialMediaLinks.find((link) => link.platform === "youtube")?.url ||
        null;

      const completeData = {
        ...values,
        id: profile.id,
        clerkUserId: profile.clerkUserId,
        availability: availabilityData,
        certifications: certifications,
        trainerType: trainerType,
        alternateContact: showAlternateContact
          ? {
              name: alternateName,
              email: alternateEmail,
            }
          : undefined,
        twitterLink: twitterLink ? twitterLink : null,
        instagramLink: instagramLink ? instagramLink : null,
        facebookLink: facebookLink ? facebookLink : null,
        youtubeLink: youtubeLink ? youtubeLink : null,
      };
      console.log("completeData", completeData);
      // Send data to the API
      const response = await fetch("/api/trainer-profile/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeData),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast("Profile updated successfully!");

      // Add redirect after successful submission
      window.location.href = "/dashboard"; // Change this to your desired redirect path
    } catch (error) {
      console.error("Form submission error", error);
      toast("Failed to update profile. Please try again.");
    }
  }

  function ApprovedTrainerGreeting() {
    return (
      <div>
        <h1>Trainer Editing Page</h1>
        <h3>Choose what information is shown on your profile. </h3>
      </div>
    );
  }

  function NewTrainerGreeting() {
    return (
      <div>
        <h1>Thank you for choosing PrimePears!</h1>
        <h3>
          Please fill out the information and we will review your profile.{" "}
        </h3>
        <h4>This information will be displayed to the public.</h4>
      </div>
    );
  }

  interface GreetingProps {
    isTrainer: boolean;
  }
  function Greeting({ isTrainer }: GreetingProps) {
    if (isTrainer) {
      return <ApprovedTrainerGreeting />;
    }
    return <NewTrainerGreeting />;
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto py-5 flex justify-center text-center">
        <Greeting isTrainer={profile.isTrainer} />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="space-y-8 max-w-3xl mx-auto"
        >
          {/* Trainer Type Section */}
          <Card className="w-full mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-center">Trainer Type</CardTitle>
              <CardDescription className="text-center">
                Select your specialization
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <FormField
                control={form.control}
                name="trainerType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setTrainerType(value);
                      }}
                    >
                      <SelectTrigger className="w-3/4 mx-auto min-w-[240px]">
                        <SelectValue placeholder="Select trainer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Name and Email Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Name"
                        type="text"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        type="email"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Alternate Contact Info Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="alternate-contact"
              checked={showAlternateContact}
              onCheckedChange={(checked) =>
                setShowAlternateContact(checked === true)
              }
            />
            <Label htmlFor="alternate-contact">
              Press here if you want to use a different name when interacting
              with clients
            </Label>
          </div>

          {/* Alternate Contact Info Section */}
          {showAlternateContact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg ">
              <div>
                <Label htmlFor="alternate-name" className="mb-2">
                  Alternate Name
                </Label>
                <Input
                  id="alternate-name"
                  placeholder="Alternate Name"
                  value={alternateName}
                  onChange={(e) => setAlternateName(e.target.value)}
                />
              </div>
              <div>
                <div className="flex gap-2">
                  <Label htmlFor="alternate-email" className="mb-2">
                    Alternate Email
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          This will become the email used to communicate with
                          clients
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="alternate-email"
                  placeholder="Alternate Email"
                  type="email"
                  value={alternateEmail}
                  onChange={(e) => setAlternateEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Location Section */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Level and Rate Section */}
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate</FormLabel>
                  <FormControl>
                    <Input placeholder="Rate" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bio Section */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Bio"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Experience Section */}
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Experience"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Youtube URL Section */}
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to youtube video</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="personal video link"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Social Media Links Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>Add your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Header row with labels */}
              <div className="grid grid-cols-12 gap-3 mb-2">
                <div className="col-span-5">
                  <Label>Platform</Label>
                </div>
                <div className="col-span-6">
                  <Label>Username</Label>
                </div>
                <div className="col-span-1">
                  {/* Empty space for alignment with delete buttons */}
                </div>
              </div>

              {socialMediaLinks.map((link) => (
                <div
                  key={link.id}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-5">
                    <Select
                      value={link.platform}
                      onValueChange={(value) =>
                        updateSocialMediaLink(link.id, "platform", value)
                      }
                    >
                      <SelectTrigger
                        id={`platform-${link.id}`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-6">
                    <div className="flex w-full">
                      <div className="flex items-center flex-grow">
                        <span className="mr-1">@</span>
                        <Input
                          id={`url-${link.id}`}
                          placeholder="username"
                          value={link.url}
                          onChange={(e) =>
                            updateSocialMediaLink(
                              link.id,
                              "url",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      </div>
                      {link.platform && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 ml-2 text-muted-foreground shrink-0"
                          onClick={() => openHelpDialog(link.platform!)}
                        >
                          <HelpCircle className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Find</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSocialMediaLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {socialMediaLinks.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSocialMediaLink}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Social Media Link
                </Button>
              )}

              <div className="text-sm text-muted-foreground text-right">
                {socialMediaLinks.length}/4 social media links added
              </div>
            </CardContent>
          </Card>
          <SocialMediaHelpDialog
            open={helpOpen}
            onOpenChange={setHelpOpen}
            platform={selectedPlatform}
          />
          {/* Certifications Section */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Add up to 4 professional certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.length > 0 && (
                <div className="space-y-2">
                  {certifications.map((cert) => (
                    <Card key={cert.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span>{cert.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(cert.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {certifications.length < 4 && (
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="certification-name">
                      Add Certification
                    </Label>
                    <Input
                      id="certification-name"
                      value={newCertName}
                      onChange={(e) => setNewCertName(e.target.value)}
                      placeholder="Certification name"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addCertification}
                    disabled={!newCertName.trim()}
                    className="mb-0.5"
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="text-sm text-muted-foreground text-right">
                {certifications.length}/4 certifications added
              </div>
            </CardContent>
          </Card>

          {/* Availability Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Set Your Availability
              </CardTitle>
              <CardDescription>
                Add your weekly availability schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {availabilities.map((dayAvail) => (
                <div
                  key={dayAvail.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-xs">
                      <Label htmlFor={`day-${dayAvail.id}`}>Day</Label>
                      <Select
                        value={dayAvail.day}
                        onValueChange={(value) => updateDay(dayAvail.id, value)}
                      >
                        <SelectTrigger id={`day-${dayAvail.id}`}>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem
                              key={day}
                              value={day}
                              disabled={availabilities.some(
                                (a) => a.day === day && a.id !== dayAvail.id
                              )}
                            >
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeDay(dayAvail.id)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {dayAvail.timeRanges.map((timeRange) => (
                    <div key={timeRange.id} className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label htmlFor={`start-${timeRange.id}`}>
                          Start Time
                        </Label>
                        <Input
                          id={`start-${timeRange.id}`}
                          type="time"
                          value={timeRange.startTime}
                          onChange={(e) =>
                            updateTimeRange(
                              dayAvail.id,
                              timeRange.id,
                              "startTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`end-${timeRange.id}`}>End Time</Label>
                        <Input
                          id={`end-${timeRange.id}`}
                          type="time"
                          value={timeRange.endTime}
                          onChange={(e) =>
                            updateTimeRange(
                              dayAvail.id,
                              timeRange.id,
                              "endTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          removeTimeRange(dayAvail.id, timeRange.id)
                        }
                        disabled={dayAvail.timeRanges.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeRange(dayAvail.id)}
                    className="mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Time Range
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addDay}
                disabled={availabilities.length >= days.length}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={updateAvailabilityData}
              >
                Preview Availability
              </Button>
            </CardFooter>
          </Card>

          {/* Availability Preview */}
          <div className="w-full flex flex-col items-center">
            <AvailabilityCard
              title="Weekly Availability Preview"
              availabilitySlots={availabilityData}
            />
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
