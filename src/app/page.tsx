import { PlatformSections } from "@/components/platform-sections";
import { HomeCatalog } from "@/components/home-catalog";
import { MoodSuggestionsSection } from "@/components/mood-suggestions-section";
import { RecommendationsSection } from "@/components/recommendations-section";

export default function HomePage() {
  return (
    <div>
      <HomeCatalog
        afterHero={
          <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8">
            <RecommendationsSection />
            <MoodSuggestionsSection />
            <PlatformSections />
          </div>
        }
      />
    </div>
  );
}
