"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  ArrowLeft,
  Save,
  Loader,
  Mail,
  Shield,
  Link as LinkIcon,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    refreshUser,
  } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/user/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load user profile
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        avatar: user.avatar || "",
      });
      setImageError(false);
      setIsFetching(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "avatar") {
      setImageError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim().length === 0) {
      showError("Name is required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
      await refreshUser();
    } catch (error) {
      showError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-indigo-500/20 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl shadow-indigo-950/30">
          <div className="flex items-center justify-center gap-3 text-slate-200">
            <Loader size={18} className="animate-spin text-indigo-300" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const accountType =
    user?.provider === "credentials"
      ? "Email and Password"
      : user?.provider
        ? `${user.provider.charAt(0).toUpperCase()}${user.provider.slice(1)}`
        : "Unknown";

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen !p-6 md:!p-12 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between gap-4 !mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Button
              variant="secondary"
              style={{
                borderColor: "rgba(129, 140, 248, 0.35)",
                color: "#e2e8f0",
                background: "rgba(30, 41, 59, 0.4)",
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs text-indigo-200 rounded-full border border-indigo-400/30 bg-indigo-400/10 !px-3 !py-1.5">
            Account Settings
          </div>
        </div>

        <section
          className="w-full rounded-[32px] border border-slate-800/70 bg-slate-950/70 backdrop-blur-xl shadow-[0_30px_80px_rgba(15,23,42,0.55)] overflow-hidden !mt-4"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(99,102,241,0.18), transparent 40%), radial-gradient(circle at 90% 10%, rgba(14,165,233,0.18), transparent 45%), rgba(2,6,23,0.7)",
          }}
        >
          <div className="!px-8 md:!px-14 !pt-12 !pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-5 !gap-10">
              <aside className="lg:col-span-2">
                <div className="rounded-3xl border border-slate-800/60 bg-slate-950/70 !p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border border-indigo-400/30 bg-slate-900">
                      {formData.avatar && !imageError ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.avatar}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        </>
                      ) : (
                        <span className="text-2xl font-semibold text-indigo-200">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-white">
                        {formData.name || "Your Profile"}
                      </h1>
                      <p className="text-sm text-slate-400">
                        Manage your details
                      </p>
                    </div>
                  </div>

                  <div className="!mt-6 !space-y-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 !p-4">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        <Mail size={13} />
                        Email
                      </div>
                      <p className="!mt-2 text-sm text-slate-100 break-all">
                        {user?.email}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 !p-4">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        <Shield size={13} />
                        Sign-in Method
                      </div>
                      <p className="!mt-2 text-sm text-slate-100">
                        {accountType}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="lg:col-span-3">
                <div className="!mb-6">
                  <h2 className="text-3xl font-semibold text-white">
                    Profile Details
                  </h2>
                  <p className="text-sm text-slate-400 !mt-1">
                    Update how your profile appears across the app.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="!space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 !gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-200 !mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 !px-4 !py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-200 !mb-2">
                        Avatar Image URL
                      </label>
                      <div className="relative">
                        <LinkIcon
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                        />
                        <input
                          type="url"
                          name="avatar"
                          placeholder="https://example.com/avatar.jpg"
                          value={formData.avatar}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 !pl-10 !pr-4 !py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
                        />
                      </div>
                      <p className="text-xs text-slate-500 !mt-2">
                        Use a direct image link (JPG or PNG) for best results.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 !p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Preview
                    </p>
                    <div className="!mt-4 flex items-center !gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                        {formData.avatar && !imageError ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.avatar}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                              onError={() => setImageError(true)}
                            />
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-indigo-200">
                            {initials}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">
                          {formData.name || "Your Name"}
                        </p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 !gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        background: isLoading ? "#6366f166" : "#6366f1",
                        color: "#ffffff",
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Link href="/auth/change-password" className="w-full">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        style={{
                          borderColor: "rgba(129, 140, 248, 0.45)",
                          color: "#c7d2fe",
                          background: "rgba(99, 102, 241, 0.12)",
                        }}
                      >
                        Change Password
                      </Button>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
