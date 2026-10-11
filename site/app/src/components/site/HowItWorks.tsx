import type { Settings } from "../../lib/types";

// How commissioning works: numbered steps as a ruled list (divide-y hairlines,
// no cards). Heading, intro and every step are owner-editable in admin
// Settings; steps are blank-line-separated blocks whose first line is the
// title and the rest the body. Stacks the number above the text on mobile,
// two columns from md.

function parseSteps(text: string): { title: string; body: string }[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.trim().split("\n");
      return { title: lines[0]?.trim() ?? "", body: lines.slice(1).join(" ").trim() };
    })
    .filter((step) => step.title.length > 0);
}

export function HowItWorks({ settings }: { settings: Settings }) {
  const steps = parseSteps(settings.process_steps);
  if (steps.length === 0) return null;

  return (
    <section id="process" className="bg-beige">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">
            {settings.process_heading}
          </h2>
          {settings.process_intro.trim() ? (
            <p className="mt-5 font-body text-base leading-relaxed text-ink/75">
              {settings.process_intro}
            </p>
          ) : null}
        </div>

        <ol className="mt-12 divide-y divide-silver/50 border-t border-silver/50">
          {steps.map((step, index) => (
            <li key={step.title} className="grid gap-2 py-8 md:grid-cols-[6rem_1fr] md:gap-10">
              <span className="font-display text-3xl text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="max-w-2xl">
                <h3 className="font-display text-xl text-ink">{step.title}</h3>
                <p className="mt-2 font-body text-base leading-relaxed text-ink/75">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
