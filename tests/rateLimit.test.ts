import { describe, expect, it } from "vitest";
import { rateLimit } from "../lib/rateLimit";

describe("rateLimit", () => {
  it("allows up to limit within window", () => {
    const key = "test:rateLimit";
    const first = rateLimit({ key, limit: 2, windowMs: 1000 });
    const second = rateLimit({ key, limit: 2, windowMs: 1000 });
    const third = rateLimit({ key, limit: 2, windowMs: 1000 });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third.ok).toBe(false);
  });
});
