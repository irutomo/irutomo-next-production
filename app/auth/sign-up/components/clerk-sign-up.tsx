'use client';

import { SignUp } from '@clerk/nextjs';

interface ClerkSignUpProps {
  redirectUrl: string;
}

export default function ClerkSignUp({ redirectUrl }: ClerkSignUpProps) {
  return (
    <SignUp 
      path="/auth/sign-up"
      routing="path"
      appearance={{
        elements: {
          formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
          card: 'rounded-lg shadow-md',
        },
      }}
      signInUrl="/auth/sign-in"
      redirectUrl={redirectUrl}
    />
  );
} 