const REGION_KEY = "quvi.region";

/** Detect ISO country code from the user's location (IP), cached per session. */
export async function detectRegion(): Promise<string> {
  if (typeof window === "undefined") return "US";

  const cached = sessionStorage.getItem(REGION_KEY);
  if (cached && /^[A-Z]{2}$/.test(cached)) return cached;

  try {
    const res = await fetch("https://ipapi.co/country_code/", {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const code = (await res.text()).trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) {
        sessionStorage.setItem(REGION_KEY, code);
        return code;
      }
    }
  } catch {
    /* fall through */
  }

  const fromLocale = regionFromLocale(navigator.language);
  sessionStorage.setItem(REGION_KEY, fromLocale);
  return fromLocale;
}

function regionFromLocale(locale: string): string {
  const part = locale.split("-")[1];
  if (part && /^[a-zA-Z]{2}$/.test(part)) return part.toUpperCase();
  return "US";
}
