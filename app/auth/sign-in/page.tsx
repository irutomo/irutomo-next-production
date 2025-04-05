import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | IRUTOMO - 日本の飲食店予約サービス",
  description: "ログイン・会員登録してIRUTOMOのサービスをご利用ください。",
};

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-orange-500 hover:bg-orange-600 text-sm normal-case",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
} 