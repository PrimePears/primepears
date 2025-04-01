import { z } from "zod";

// Define the social media link schema
const SocialMediaLinkSchema = z.object({
  id: z.string(),
  platform: z
    .string()
    .min(1, {
      message: "Please select a platform.",
    })
    .optional(),
  url: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional(),
});

// Define the alternate contact schema
const AlternateContactSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Alternate name must be at least 2 characters.",
    })
    .optional(),
  email: z
    .string()
    .email({
      message: "Please enter a valid alternate email.",
    })
    .optional(),
});

export const CreateProfileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  displayName: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .optional(),
  location: z.string(),
  // level: z.coerce.number().min(1).max(5),
  rate: z.coerce.number().min(1),
  bio: z.string().optional(),
  experience: z.string().optional(),
  videoUrl: z.string(),
  // New fields
  trainerType: z.string().optional(),
  alternateContact: AlternateContactSchema.optional(),
  socialMediaLinks: z.array(SocialMediaLinkSchema).optional(),
  twitterLink: z.string().optional().nullable(),
  facebookLink: z.string().optional().nullable(),
  instagramLink: z.string().optional().nullable(),
  youtubeLink: z.string().optional().nullable(),
});

// Export types for use in components
export type CreateProfileFormValues = z.infer<typeof CreateProfileFormSchema>;
export type SocialMediaLink = z.infer<typeof SocialMediaLinkSchema>;
export type AlternateContact = z.infer<typeof AlternateContactSchema>;
