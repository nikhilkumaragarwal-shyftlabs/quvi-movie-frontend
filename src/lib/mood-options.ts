export const MOOD_OPTIONS = [
  { slug: "happy", label: "Happy" },
  { slug: "sad", label: "Sad" },
  { slug: "excited", label: "Excited" },
  { slug: "relaxed", label: "Relaxed" },
  { slug: "romantic", label: "Romantic" },
  { slug: "scary", label: "Scary" },
  { slug: "thought_provoking", label: "Thought-provoking" },
  { slug: "family_friendly", label: "Family-friendly" },
  { slug: "light_fun", label: "Something light & fun" },
  { slug: "intense", label: "Something intense" },
  { slug: "surprise", label: "Surprise me" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { slug: "quick_watch", label: "A quick watch" },
  { slug: "binge_worthy", label: "A binge-worthy series" },
  { slug: "award_winning", label: "An award-winning film" },
  { slug: "hidden_gem", label: "A hidden gem" },
  { slug: "classic", label: "A classic movie" },
  { slug: "trending", label: "A trending title" },
  { slug: "similar_liked", label: "Similar to something I enjoyed" },
] as const;

export type MoodSlug = (typeof MOOD_OPTIONS)[number]["slug"];
export type ExperienceSlug = (typeof EXPERIENCE_OPTIONS)[number]["slug"];

export type MoodPreferences = {
  mood?: MoodSlug;
  experience?: ExperienceSlug;
  similarMediaType?: "movie" | "tv";
  similarId?: number;
};

const STORAGE_KEY = "quvi.mood";

export function loadMoodPreferences(): MoodPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MoodPreferences) : {};
  } catch {
    return {};
  }
}

export function saveMoodPreferences(prefs: MoodPreferences) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
