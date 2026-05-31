"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { showError } = useToast();

  useEffect(() => {
    (async () => {
      try {
        // Exchange NextAuth session for app JWT cookie
        const resp = await fetch(`/api/auth/exchange-session`);
        if (!resp.ok) {
          const err = await resp.json();
          showError(err.message || "OAuth exchange failed");
        }

        // Read redirect param
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirectTo") || "/";
        router.replace(redirectTo);
      } catch (e: any) {
        showError("OAuth exchange failed");
        router.replace("/");
      }
    })();
  }, [router, showError]);

  return <div>Signing you in...</div>;
}
