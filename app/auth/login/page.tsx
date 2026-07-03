"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState("/");
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Read redirect query param on client
    try {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("redirectTo");
      if (r) setRedirectTo(r);
    } catch {
      // ignore
    }

    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  if (isAuthenticated) {
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

    if (!formData.email || !formData.password) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
      showSuccess("Login successful!");
      router.replace(redirectTo);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Login failed");
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

        {/* Google/GitHub OAuth disabled for now - not needed for personal use
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
        */}

        <div className="text-center">
          <p style={{ color: "#cbd5e0" }}>
            Don&apos;t have an account?{" "}
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
