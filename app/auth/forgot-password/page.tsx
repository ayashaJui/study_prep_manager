"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/contexts/ToastContext";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showError("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Failed to process request");
        return;
      }

      showSuccess("Check your email for password reset instructions");
      setSubmitted(true);
      setEmail("");
    } catch (error: any) {
      showError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0f1419" }}
    >
      <Card className="w-full max-w-md">
        <div className="text-center !mb-8">
          <div className="flex items-center justify-center gap-3 !mb-4">
            <Mail size={32} style={{ color: "#667eea" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#e2e8f0" }}>
              Forgot Password
            </h1>
          </div>
          <p style={{ color: "#cbd5e0" }}>
            Enter your email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div
              className="!p-4 rounded-lg !mb-4"
              style={{ background: "rgba(72, 187, 120, 0.1)" }}
            >
              <p style={{ color: "#48bb78" }}>✓ Email sent successfully!</p>
            </div>
            <p style={{ color: "#cbd5e0" }} className="!mb-4">
              Check your email for password reset instructions. The link expires
              in 10 minutes.
            </p>
            <Link href="/auth/login">
              <Button style={{ background: "#667eea", color: "white", width: "100%" }}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="!space-y-4">
            <div>
              <label
                className="block text-sm font-medium !mb-2"
                style={{ color: "#cbd5e0" }}
              >
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              style={{
                background: isLoading ? "#667eea66" : "#667eea",
                color: "#fff",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <div className="!mt-6 text-center">
          <p style={{ color: "#cbd5e0" }}>
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold hover:underline"
              style={{ color: "#667eea" }}
            >
              Login here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
