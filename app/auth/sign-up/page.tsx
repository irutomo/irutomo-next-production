import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "会員登録 | IRUTOMO - 日本の飲食店予約サービス",
  description: "IRUTOMOに会員登録して、簡単に飲食店予約をご利用ください。",
};

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignUp
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