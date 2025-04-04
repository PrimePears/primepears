"use client";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export function Footer() {
  const { user } = useUser();

  return (
    <footer className="bg-background border-t w-4/5 mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex flex-row items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <Image
                  src="/logo/prime_pear_logo.png"
                  width="50"
                  height="60"
                  alt="Prime Pears logo"
                />
              </div>
              <span className="text-xl font-semibold">Prime Pears</span>
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-6 w-full md:w-auto">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/trainers"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Trainers
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/faq"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/contact-us"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
          <Link
            href={`/trainer-profile/edit/${user?.id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Become a Trainer
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Prime Pears Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
