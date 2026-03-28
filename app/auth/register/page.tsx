"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
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
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
      );
      showSuccess("Registration successful!");
      router.push("/");
    } catch (error: any) {
      showError(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0f1419" }}>
      <Card className="w-full max-w-md">
        <div className="text-center !mb-8">
          <div className="flex items-center justify-center gap-3 !mb-4">
            <UserPlus size={32} style={{ color: "#667eea" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#e2e8f0" }}>
              Register
            </h1>
          </div>
          <p style={{ color: "#cbd5e0" }}>
            Create an account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="!space-y-4">
          <div>
            <label className="block text-sm font-medium !mb-2" style={{ color: "#cbd5e0" }}>
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

          <div>
            <label className="block text-sm font-medium !mb-2" style={{ color: "#cbd5e0" }}>
              Email
            </label>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium !mb-2" style={{ color: "#cbd5e0" }}>
              Password
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
            <label className="block text-sm font-medium !mb-2" style={{ color: "#cbd5e0" }}>
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
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <div className="!mt-6 text-center">
          <p style={{ color: "#cbd5e0" }}>
            Already have an account?{" "}
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
