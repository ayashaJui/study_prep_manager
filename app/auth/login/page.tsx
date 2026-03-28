"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { LogIn, Github } from "lucide-react";

// Icon component for Google
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [oauthLoading, setOAuthLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setOAuthLoading(provider);
      await signIn(provider, { redirect: true, callbackUrl: "/" });
    } catch (error: any) {
      showError(`${provider} sign in failed: ${error.message}`);
    } finally {
      setOAuthLoading(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
      showSuccess("Login successful!");
      router.push("/");
    } catch (error: any) {
      showError(error.message || "Login failed");
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
            <LogIn size={32} style={{ color: "#667eea" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#e2e8f0" }}>
              Login
            </h1>
          </div>
          <p style={{ color: "#cbd5e0" }}>
            Sign in to access your study materials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="!space-y-4">
          <div>
            <label
              className="block text-sm font-medium !mb-2"
              style={{ color: "#cbd5e0" }}
            >
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
            <label
              className="block text-sm font-medium !mb-2"
              style={{ color: "#cbd5e0" }}
            >
              Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
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
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="!mt-6 !mb-4">
          <div className="relative !mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-2"
                style={{ background: "#1e293b", color: "#cbd5e0" }}
              >
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 !px-4 !py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{
                borderColor: "#667eea",
                color: "#e2e8f0",
                background: "transparent",
              }}
            >
              <GoogleIcon />
              <span className="text-sm font-medium">Google</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn("github")}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 !px-4 !py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{
                borderColor: "#667eea",
                color: "#e2e8f0",
                background: "transparent",
              }}
            >
              <Github size={18} />
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <p style={{ color: "#cbd5e0" }}>
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold hover:underline"
              style={{ color: "#667eea" }}
            >
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
