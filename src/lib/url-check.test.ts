import { describe, expect, it } from "vitest";
import { analyzeUrl } from "./url-check";

describe("analyzeUrl", () => {
  it("rejects non-http schemes", () => expect(analyzeUrl("javascript:alert(1)").valid).toBe(false));
  it("rejects empty input", () => expect(analyzeUrl("  ").valid).toBe(false));
  it("flags raw IP with brand as high", () => {
    const r = analyzeUrl("http://192.168.1.1/paypal-login");
    expect(r.valid && r.risk).toBe("high");
  });
  it("plain https domain is low", () => {
    const r = analyzeUrl("https://wikipedia.org");
    expect(r.valid && r.risk).toBe("low");
  });
});
