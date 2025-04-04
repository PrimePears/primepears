"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Dumbbell,
  Home,
  Info,
  PenIcon as UserPen,
} from "lucide-react";
import { SignedIn, SignedOut, useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileProps {
  id: string;
  clerkUserId: string;
  name: string;
  email: string;
  isTrainer: boolean;
  bio: string | null;
  experience: string | null;
  videoUrl: string;
  location: string;
  rate: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

function DashboardButton() {
  // const { user } = useUser();
  {
    /* TODO : Fix link href={`/trainer-profile/dashboard/${user?.id}`} */
  }
  return (
    <Link href={`/`}>
      <Button
        variant="default"
        className="flex items-center gap-2 bg-custom-button-green hover:bg-custom-button-hover-green"
      >
        <UserPen className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Button>
    </Link>
  );
}

export default function NavBar({ profile }: { profile: ProfileProps | null }) {
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Card className="w-full shadow-sm z-50">
      <nav className="relative w-full">
        {/* Desktop Navigation */}
        <div className="w-full mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                className="cursor-pointer"
                src="/logo/prime_pear_logo.png"
                height="0"
                width="50"
                alt="Logo"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-700"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop Links - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/">
              <Button
                variant="default"
                className="flex items-center gap-2 bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            {/* TODO : Fix link /trainers */}
            <Link href="/">
              <Button
                variant="default"
                className="flex items-center gap-2 bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Dumbbell className="h-4 w-4" />
                Trainers
              </Button>
            </Link>
            {/* TODO : Fix link /about */}
            <Link href="/">
              <Button
                variant="default"
                className="flex items-center gap-2 bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Info className="h-4 w-4" />
                About
              </Button>
            </Link>
            {/* TODO : Fix link /faq */}
            <Link href="/">
              <Button
                variant="default"
                className="flex items-center gap-2 bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Info className="h-4 w-4" />
                FAQ
              </Button>
            </Link>
          </div>

          {/* Auth Buttons - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <SignedIn>
              <div className="flex items-center space-x-2">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl || "/defaultAvatar.jpg"}
                    alt="Profile Picture"
                    width={35}
                    height={35}
                    className="rounded-md"
                  />
                ) : (
                  // </Link>
                  <div className="w-8 h-8 bg-gray-300 "></div>
                )}
                {profile?.isTrainer && <DashboardButton />}

                <SignOutButton>
                  <Button
                    variant="default"
                    className="bg-custom-button-green hover:bg-custom-button-hover-green"
                  >
                    Sign out
                  </Button>
                </SignOutButton>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center space-x-2">
                <Link href="/sign-up">
                  <Button
                    variant="default"
                    className="bg-custom-button-green hover:bg-custom-button-hover-green"
                  >
                    Sign Up
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    variant="default"
                    className="bg-custom-button-green hover:bg-custom-button-hover-green"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Menu - Shown when mobileMenuOpen is true */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-white shadow-md z-50 transition-all duration-300 ease-in-out md:hidden",
            mobileMenuOpen
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          )}
        >
          <div className="flex flex-col p-4 space-y-3">
            <Link href="/" onClick={toggleMobileMenu}>
              <Button
                variant="default"
                className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            {/* TODO : Fix link /trainers */}
            <Link href="/" onClick={toggleMobileMenu}>
              <Button
                variant="default"
                className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Trainers
              </Button>
            </Link>
            {/* TODO : Fix link /about */}
            <Link href="/" onClick={toggleMobileMenu}>
              <Button
                variant="default"
                className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Info className="h-4 w-4 mr-2" />
                About
              </Button>
            </Link>
            {/* TODO : Fix link /faq */}
            <Link href="/" onClick={toggleMobileMenu}>
              <Button
                variant="default"
                className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
              >
                <Info className="h-4 w-4 mr-2" />
                FAQ
              </Button>
            </Link>

            <div className="pt-2 border-t border-gray-200">
              <SignedIn>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl || "/placeholder.svg"}
                        alt="Profile Picture"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300"></div>
                    )}
                    <span className="font-medium">
                      {user?.fullName || user?.username}
                    </span>
                  </div>

                  {/* <Link
                    href={`/trainer-profile/edit/${user?.id}`}
                    onClick={toggleMobileMenu}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      View Profile
                    </Button>
                  </Link> */}

                  {/* TODO : Fix link href={`/trainer-profile/dashboard/${user?.id}`} */}
                  {profile?.isTrainer && (
                    <Link href={`/`} onClick={toggleMobileMenu}>
                      <Button
                        variant="default"
                        className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
                      >
                        <UserPen className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}

                  <SignOutButton>
                    <Button
                      variant="default"
                      className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
                    >
                      Sign out
                    </Button>
                  </SignOutButton>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col space-y-3">
                  <Link href="/sign-up" onClick={toggleMobileMenu}>
                    <Button
                      variant="default"
                      className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
                    >
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/sign-in" onClick={toggleMobileMenu}>
                    <Button
                      variant="default"
                      className="w-full justify-start bg-custom-button-green hover:bg-custom-button-hover-green"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>
    </Card>
  );
}
