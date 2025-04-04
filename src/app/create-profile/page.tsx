"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

type ApiResponse = {
  message: string;
  error?: string;
};

async function createProfileRequest() {
  const response = await fetch("/api/create-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data as ApiResponse;
}

export default function CreateProfile() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { mutate, isPending, isSuccess } = useMutation<ApiResponse, Error>({
    mutationFn: createProfileRequest,
    onSuccess: () => {
      setIsRedirecting(true);

      // Redirect to homepage after a delay (3 seconds)

      router.push("/");
    },
    onError: (error) => {
      void error;
      return notFound();
    },
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending && !isSuccess) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="text-center">
        {isRedirecting ? (
          <>
            <div className="mb-4 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">Sign In Successful!</span>
            </div>
            <div className="text-sm text-muted-foreground">
              You will be redirected to the homepage in a moment...
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">Processing Sign In...</div>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
}
