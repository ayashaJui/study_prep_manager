"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthSignin: "OAuth sign-in failed. Please try again.",
    OAuthCallback: "OAuth callback error. Please try again.",
    EmailSigninEmail: "Check your email address and try again.",
    Callback: "Error in authentication callback.",
    OAuthCreateAccount:
      "Unable to create OAuth account. Email may already exist.",
    EmailCreateAccount: "Unable to create account. Please try again.",
    default: "An authentication error occurred. Please try again.",
  };

  const message = errorMessages[error as string] || errorMessages.default;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0f1419" }}
    >
      <Card className="w-full max-w-md">
        <div className="text-center !mb-8">
          <div className="flex items-center justify-center gap-3 !mb-4">
            <AlertCircle size={32} style={{ color: "#f87171" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#e2e8f0" }}>
              Authentication Error
            </h1>
          </div>
          <p style={{ color: "#cbd5e0" }} className="text-lg">
            {message}
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/login" className="block">
            <Button
              className="w-full"
              style={{
                background: "#667eea",
                color: "white",
              }}
            >
              Back to Login
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button
              className="w-full"
              style={{
                background: "transparent",
                color: "#667eea",
                border: "1px solid #667eea",
              }}
            >
              Go to Home
            </Button>
          </Link>
        </div>

        <div className="!mt-6 text-center text-sm" style={{ color: "#a0aec0" }}>
          <p>
            Error code:{" "}
            <code style={{ background: "rgba(45, 55, 72, 0.4)" }}>{error}</code>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "#0f1419" }}
        >
          <Card className="w-full max-w-md text-center">
            <p style={{ color: "#cbd5e0" }}>Loading...</p>
          </Card>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
