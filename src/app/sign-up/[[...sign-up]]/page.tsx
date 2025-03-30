import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center m-8">
      <SignUp forceRedirectUrl="/create-profile" />
    </div>
  );
}
