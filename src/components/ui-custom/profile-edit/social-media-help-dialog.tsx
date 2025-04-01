"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

interface SocialMediaHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: string | null;
}

export function SocialMediaHelpDialog({
  open,
  onOpenChange,
  platform,
}: SocialMediaHelpDialogProps) {
  const getPlatformIcon = () => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case "facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case "twitter":
        return <Twitter className="h-5 w-5 text-sky-500" />;
      case "youtube":
        return <Youtube className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getPlatformInstructions = () => {
    switch (platform) {
      case "instagram":
        return (
          <div className="space-y-2">
            <p>To find your Instagram username:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open the Instagram app or website</li>
              <li>Go to your profile</li>
              <li>
                Your username appears at the top of your profile (starts with @)
              </li>
              <li>
                Alternatively, check the URL: instagram.com/
                <strong>username</strong>
              </li>
            </ol>
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
              <p className="text-sm font-medium">Example:</p>
              <p className="text-sm mt-1">
                If your profile URL is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  https://instagram.com/therock
                </span>
              </p>
              <p className="text-sm mt-1">
                Your username is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  therock
                </span>
              </p>
            </div>
          </div>
        );
      case "facebook":
        return (
          <div className="space-y-2">
            <p>To find your Facebook username:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Log in to Facebook</li>
              <li>Click on your profile</li>
              <li>
                Look at the URL in your browser: facebook.com/
                <strong>username</strong>
              </li>
              <li>
                If you see numbers instead of a name, you may not have set a
                username yet
              </li>
            </ol>
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
              <p className="text-sm font-medium">Example:</p>
              <p className="text-sm mt-1">
                If your profile URL is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  https://facebook.com/DwayneJohnson
                </span>
              </p>
              <p className="text-sm mt-1">
                Your username is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  DwayneJohnson
                </span>
              </p>
            </div>
          </div>
        );
      case "twitter":
        return (
          <div className="space-y-2">
            <p>To find your Twitter/X username:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Log in to Twitter/X</li>
              <li>Go to your profile</li>
              <li>
                Your username appears next to your display name with an @ symbol
              </li>
              <li>
                Check the URL: twitter.com/<strong>username</strong>
              </li>
            </ol>
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
              <p className="text-sm font-medium">Example:</p>
              <p className="text-sm mt-1">
                If your profile URL is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  https://twitter.com/TheRock
                </span>
              </p>
              <p className="text-sm mt-1">
                Your username is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  TheRock
                </span>
              </p>
            </div>
          </div>
        );
      case "youtube":
        return (
          <div className="space-y-2">
            <p>To find your YouTube username or handle:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to YouTube and sign in</li>
              <li>Click on your profile picture and go to "Your channel"</li>
              <li>
                Look for your handle in the URL: youtube.com/@
                <strong>handle</strong>
              </li>
              <li>
                Or find your custom URL: youtube.com/c/
                <strong>customname</strong>
              </li>
            </ol>
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
              <p className="text-sm font-medium">Example:</p>
              <p className="text-sm mt-1">
                If your channel URL is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  https://youtube.com/@therock
                </span>
              </p>
              <p className="text-sm mt-1">
                Your username is{" "}
                <span className="font-mono text-xs bg-slate-100 p-1 rounded">
                  therock
                </span>
              </p>
            </div>
          </div>
        );
      default:
        return <p>Select a platform to see instructions.</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon()}
            How to find your{" "}
            {platform
              ? platform.charAt(0).toUpperCase() + platform.slice(1)
              : ""}{" "}
            username
          </DialogTitle>
          <DialogDescription>
            Follow these steps to locate your username
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">{getPlatformInstructions()}</div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
