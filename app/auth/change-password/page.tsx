"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Lock, ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/auth/change-password");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword) {
      showError("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Failed to change password");
        return;
      }

      showSuccess("Password updated successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      router.push("/user/profile");
    } catch (error: any) {
      showError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <p style={{ color: "#cbd5e0" }}>Loading...</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isOAuthUser = user?.provider && user.provider !== "credentials";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center gap-2 !mb-6">
          <Link href="/user/profile" className="inline-flex items-center gap-2">
            <ArrowLeft size={16} style={{ color: "#667eea" }} />
            <span className="text-sm" style={{ color: "#cbd5e0" }}>
              Back to Profile
            </span>
          </Link>
        </div>

        <div className="text-center !mb-8">
          <div className="flex items-center justify-center gap-3 !mb-4">
            <Lock size={32} style={{ color: "#667eea" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#e2e8f0" }}>
              Change Password
            </h1>
          </div>
          <p style={{ color: "#cbd5e0" }}>
            Update your password to keep your account secure.
          </p>
        </div>

        {isOAuthUser ? (
          <div
            className="!p-4 rounded-lg text-center"
            style={{ background: "rgba(248, 113, 113, 0.08)" }}
          >
            <p style={{ color: "#f87171" }}>
              You signed in with {user?.provider}. Password changes are managed
              by that provider.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="!space-y-4">
            <div>
              <label
                className="block text-sm font-medium !mb-2"
                style={{ color: "#cbd5e0" }}
              >
                Current Password
              </label>
              <Input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium !mb-2"
                style={{ color: "#cbd5e0" }}
              >
                New Password
              </label>
              <Input
                type="password"
                name="newPassword"
                placeholder="At least 6 characters"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium !mb-2"
                style={{ color: "#cbd5e0" }}
              >
                Confirm New Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
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
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
