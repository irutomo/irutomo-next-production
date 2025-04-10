'use client';

import { SignIn } from '@clerk/nextjs';

interface ClerkSignInProps {
  redirectUrl: string;
}

export default function ClerkSignIn({ redirectUrl }: ClerkSignInProps) {
  return (
    <SignIn 
      path="/auth/sign-in"
      routing="path"
      appearance={{
        elements: {
          formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
          card: 'rounded-lg shadow-md',
        },
      }}
      signUpUrl="/auth/sign-up"
      redirectUrl={redirectUrl}
    />
  );
} 