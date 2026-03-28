"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { ArrowLeft, User as UserIcon, Save, Loader } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load user profile
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        avatar: user.avatar || "",
      });
      setIsFetching(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim().length === 0) {
      showError("Name is required");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          avatar: formData.avatar || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Failed to update profile");
        return;
      }

      showSuccess("Profile updated successfully!");
      // Optionally refresh user data
    } catch (error: any) {
      showError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isFetching) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#0f1419" }}
      >
        <Card className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2">
            <Loader
              size={20}
              className="animate-spin"
              style={{ color: "#667eea" }}
            />
            <p style={{ color: "#cbd5e0" }}>Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "#0f1419" }}>
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 !mb-6">
          <Button
            style={{
              background: "#667eea",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </Link>

        {/* Profile Card */}
        <Card>
          <CardTitle>
            <div className="flex items-center gap-3">
              <UserIcon size={24} style={{ color: "#667eea" }} />
              <h1 style={{ color: "#e2e8f0" }}>Edit Profile</h1>
            </div>
          </CardTitle>

          <form onSubmit={handleSubmit} className="!space-y-6">
            {/* User Info Display */}
            <div
              className="!p-4 rounded-lg"
              style={{ background: "rgba(45, 55, 72, 0.4)" }}
            >
              <p className="text-sm" style={{ color: "#a0aec0" }}>
                Email
              </p>
              <p className="text-lg font-medium" style={{ color: "#e2e8f0" }}>
                {user?.email}
              </p>
            </div>

            {/* Name Field */}
            <div>
              <label
                className="block text-sm font-medium !mb-2"
                style={{ color: "#cbd5e0" }}
              >
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* Avatar URL Field */}
            <div>
              <label
                className="block text-sm font-medium !mb-2"
                style={{ color: "#cbd5e0" }}
              >
                Avatar URL (Optional)
              </label>
              <Input
                type="url"
                name="avatar"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={handleChange}
                disabled={isLoading}
              />
              {formData.avatar && (
                <div
                  className="!mt-3 !p-3 rounded-lg"
                  style={{ background: "rgba(45, 55, 72, 0.4)" }}
                >
                  <p className="text-xs" style={{ color: "#a0aec0" }}>
                    Preview
                  </p>
                  <img
                    src={formData.avatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-lg object-cover !mt-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Account Type */}
            <div
              className="!p-4 rounded-lg"
              style={{ background: "rgba(45, 55, 72, 0.4)" }}
            >
              <p className="text-sm" style={{ color: "#a0aec0" }}>
                Account Type
              </p>
              <p className="text-lg font-medium" style={{ color: "#e2e8f0" }}>
                {user?.provider === "credentials"
                  ? "Email & Password"
                  : user?.provider
                    ? user.provider.charAt(0).toUpperCase() +
                      user.provider.slice(1)
                    : "Unknown"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 !pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                style={{
                  background: isLoading ? "#667eea66" : "#667eea",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isLoading ? 0.7 : 1,
                  flex: 1,
                }}
              >
                <Save size={16} />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>

              <Link href="/auth/forgot-password" className="flex-1">
                <Button
                  type="button"
                  style={{
                    background: "transparent",
                    color: "#667eea",
                    border: "1px solid #667eea",
                    width: "100%",
                  }}
                >
                  Change Password
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* Account Actions */}
        <div className="!mt-8">
          <Card>
            <CardTitle>
              <div style={{ color: "#e2e8f0" }}>Account Settings</div>
            </CardTitle>
            <div className="!space-y-3">
              <p className="text-sm" style={{ color: "#cbd5e0" }}>
                Need to secure your account?{" "}
                <Link
                  href="/auth/forgot-password"
                  style={{ color: "#667eea" }}
                  className="font-semibold hover:underline"
                >
                  Change your password
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
