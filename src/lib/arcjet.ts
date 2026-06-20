import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // WAF: Protect against SQL injection and XSS
    shield({
      mode: "LIVE", // Use "DRY_RUN" to test without blocking
    }),
    // Bot Protection: Block malicious bots but allow search engines
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"], // allows Google, Bing, etc.
    }),
    // Basic Rate Limiting: 100 requests per 60 seconds per IP
    slidingWindow({
      mode: "LIVE",
      interval: "60s",
      max: 100,
    }),
  ],
});
