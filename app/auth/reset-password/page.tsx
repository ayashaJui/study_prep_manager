"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/contexts/ToastContext";
import { Lock } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      showError("Invalid or missing reset token");
      router.push("/auth/login");
      return;
    }
    setToken(resetToken);
  }, [searchParams, router, showError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      showError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Failed to reset password");
        return;
      }

      showSuccess("Password reset successfully!");
      router.push("/auth/login");
    } catch (error: any) {
      showError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#0f1419" }}
      >
        <Card className="w-full max-w-md">
          <p style={{ color: "#cbd5e0" }}>Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0f1419" }}
    >
      <Card className="w-full max-w-md">
        <div className="text-center !mb-8">
          <div className="flex items-center justify-center gap-3 !mb-4">
            <Lock size={32} style={{ color: "#667eea" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#e2e8f0" }}>
              Reset Password
            </h1>
          </div>
          <p style={{ color: "#cbd5e0" }}>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="!space-y-4">
          <div>
            <label
              className="block text-sm font-medium !mb-2"
              style={{ color: "#cbd5e0" }}
            >
              New Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium !mb-2"
              style={{ color: "#cbd5e0" }}
            >
              Confirm Password
            </label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

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

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
