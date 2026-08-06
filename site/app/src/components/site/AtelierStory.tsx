import { HeartEyeMark } from "./HeartEyeMark";
import type { Settings } from "../../lib/types";

// Atelier story: text-led 50/50 split. Story on the left; on the right the
// uploaded craft photograph, or a composed deep-beige panel with a small silver
// mark and a caption line when no image is set. Stacks on mobile (text first).

export function AtelierStory({ settings }: { settings: Settings }) {
  const storyImageKey = settings.story_image_key;
  const paragraphs = settings.story_body
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <section id="atelier" className="bg-beige">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">
            {settings.story_heading}
          </h2>
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`${i === 0 ? "mt-6" : "mt-4"} font-body text-base leading-relaxed text-ink/75`}
            >
              {paragraph}
            </p>
          ))}
          {settings.story_closing_line.trim() ? (
            <p className="mt-6 font-body text-lg italic leading-relaxed text-ink">
              {settings.story_closing_line}
            </p>
          ) : null}
        </div>

        <div className="md:order-last">
          {storyImageKey ? (
            <img
              src={`/img/${storyImageKey}`}
              alt="Zin Choc chocolate being finished by hand in the atelier"
              className="aspect-[4/5] w-full rounded-sm object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-5 rounded-sm bg-panel">
              {settings.logo_image_key ? (
                <img
                  src={`/img/${settings.logo_image_key}`}
                  alt=""
                  aria-hidden="true"
                  className="h-16 w-16 object-contain opacity-80"
                />
              ) : (
                <HeartEyeMark variant="silver" className="h-16 w-16 opacity-80" />
              )}
              <p className="max-w-[22ch] px-6 text-center font-body text-xs uppercase tracking-[0.2em] text-ink/45">
                Finished by hand, in cocoa butter, gold and silver
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
