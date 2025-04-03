import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className="w-full max-w-md px-6 py-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">IRUTOMOへログイン</h1>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-indigo-600 hover:bg-indigo-700 text-white",
              footerActionLink: "text-indigo-600 hover:text-indigo-800",
            },
          }}
          routing="path"
          path="/auth/sign-in"
          signUpUrl="/auth/sign-up"
          redirectUrl="/"
        />
      </div>
    </div>
  );
} 