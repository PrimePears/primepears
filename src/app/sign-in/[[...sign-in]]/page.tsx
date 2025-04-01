import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center m-8">
      {" "}
      <SignIn forceRedirectUrl="/create-profile" />
    </div>
  );
}
