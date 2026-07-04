import { useEffect, useLayoutEffect, useRef } from "react";

type ShortcutHandler = (e: KeyboardEvent) => void;
type ShortcutMap = Record<string, ShortcutHandler>;

// Shortcuts in this set fire even when the user is inside a text input.
const ALWAYS_FIRE = new Set(["escape", "ctrl+f"]);

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  // Ref pattern: listener is registered once, but always calls the latest handlers.
  const ref = useRef(shortcuts);

  // Keep ref in sync after every render without re-registering the listener.
  useLayoutEffect(() => {
    ref.current = shortcuts;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push("ctrl");
      if (e.shiftKey) parts.push("shift");
      parts.push(e.key.toLowerCase());
      const combo = parts.join("+");

      const fn = ref.current[combo];
      if (!fn) return;
      if (inInput && !ALWAYS_FIRE.has(combo)) return;

      fn(e);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
