const logos = [
  "Acme Corp", "Quantum", "Echo Valley", "Celestial", "PULSE", "APEX",
  "Acme Corp", "Quantum", "Echo Valley", "Celestial", "PULSE", "APEX"
];

export function LogoBar() {
  return (
    <section className="py-12 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-6 text-center">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-widest text-white/30 font-medium">
          Trusted by 4,200+ marketing teams
        </p>
      </div>

      <div className="border-t border-b border-white/8 py-8">
        <div className="relative flex w-full max-w-[1200px] mx-auto overflow-hidden mask-[linear-gradient(to_right,transparent_0,black_128px,black_calc(100%-128px),transparent_100%)]">
          <div className="flex whitespace-nowrap items-center gap-16 pr-16 motion-safe:animate-marquee">
            {logos.map((logo, idx) => (
              <span key={idx} className="text-xl font-bold tracking-tight text-white/40">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
