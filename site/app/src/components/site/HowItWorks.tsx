// How commissioning works: five numbered steps as a ruled list (divide-y
// hairlines, no cards). Copy from content-plan/home.md. Stacks the number above
// the text on mobile, two columns from md.

const STEPS = [
  {
    n: "01",
    title: "Enquire",
    body: "Write to us with your wedding date, guest numbers and the feeling you want your favours to carry. We reply within two business days.",
  },
  {
    n: "02",
    title: "Tasting and consultation",
    body: "We arrange a tasting of our couverture and signature fillings, in person in Sydney or by courier elsewhere in Australia, and talk through colours, finishes and packaging.",
  },
  {
    n: "03",
    title: "Custom design",
    body: "We prepare a design proposal for your bomboniere: flavours, finishes, monograms or motifs, and packaging. You approve every detail before anything is made. A 50% deposit secures your date.",
  },
  {
    n: "04",
    title: "Production",
    body: "Your pieces are made by hand in the weeks before your wedding, timed so the chocolate is at its freshest. Please allow four to six weeks from design approval.",
  },
  {
    n: "05",
    title: "Delivery",
    body: "Your bomboniere arrive cold-chain protected, ahead of your wedding day, ready to place at each setting. The balance is due two weeks before delivery.",
  },
];

export function HowItWorks() {
  return (
    <section id="process" className="bg-beige">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">
            How commissioning works
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-ink/75">
            A Zin Choc commission unfolds in five quiet steps.
          </p>
        </div>

        <ol className="mt-12 divide-y divide-silver/50 border-t border-silver/50">
          {STEPS.map((step) => (
            <li key={step.n} className="grid gap-2 py-8 md:grid-cols-[6rem_1fr] md:gap-10">
              <span className="font-display text-3xl text-gold">{step.n}</span>
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
