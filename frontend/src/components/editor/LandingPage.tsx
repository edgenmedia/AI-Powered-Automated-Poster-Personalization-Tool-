import Link from "next/link";

const features = [
  ["Canva-like Canvas", "Edit poster text, font, color, and placement easily."],
  ["CSV Auto Mapping", "Detect name and phone columns automatically."],
  ["AI Design Agent", "Generate trend-aware poster ideas and copy."],
  ["Bulk Generation", "Create customer-wise posters from one template."],
  ["Color Picker", "Pick colors from poster or RGB selector."],
  ["Export ZIP", "Download all generated posters together."],
];

const steps = [
  "Open Editor",
  "Upload Poster",
  "Upload CSV",
  "Auto Map Fields",
  "Generate Posters",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0B0F19] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.32),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.22),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.12),transparent_30%)]" />

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30" />
          <h1 className="text-xl font-black">Posterly</h1>
        </div>

        <div className="hidden items-center gap-7 text-sm text-white/55 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-white">Workflow</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-white/90"
        >
          Start Creating
        </Link>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 text-center">
        <div className="mx-auto mb-5 w-fit animate-pulse rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-cyan-200">
          AI Posters • CSV Personalization • Bulk Export
        </div>

        <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
          Create Personalized Posters from One Design.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
          Upload one poster, customize it in a Canva-like editor, auto-map CSV
          fields, and generate customer-wise posters instantly.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold shadow-lg shadow-violet-500/25 transition hover:scale-105"
          >
            Open Canvas Editor
          </Link>

          <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold transition hover:bg-white/10">
            Watch Demo
          </button>
        </div>

        <div className="mt-12 animate-[fadeUp_0.8s_ease-out] rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-violet-500/15 backdrop-blur-xl">
          <div className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-[#111827]">
            <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#0F172A] px-4">
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <p className="text-xs text-white/40">Posterly Canvas Studio</p>
              <button className="rounded-lg bg-white/10 px-3 py-1 text-xs">
                Export ZIP
              </button>
            </div>

            <div className="grid min-h-[390px] grid-cols-1 md:grid-cols-[190px_1fr_240px]">
              <aside className="hidden border-r border-white/10 bg-[#0B1220] p-4 text-left md:block">
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/35">
                  Uploads
                </p>

                {["Upload Poster", "Upload CSV", "Text Layer"].map((item) => (
                  <div
                    key={item}
                    className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/70 transition hover:border-cyan-400/30"
                  >
                    {item}
                  </div>
                ))}

                <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                  <p className="text-xs font-semibold text-cyan-200">
                    Auto Mapping
                  </p>
                  <p className="mt-2 text-[11px] text-white/50">
                    name → Customer Name
                  </p>
                  <p className="text-[11px] text-white/50">
                    phone → Phone Number
                  </p>
                </div>
              </aside>

              <section className="relative flex items-center justify-center bg-[#0B0F19] p-6">
                <div className="absolute left-5 top-5 animate-bounce rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-[11px] text-violet-200">
                  Floating Toolbar
                </div>

                <div className="absolute bottom-5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] text-emerald-200">
                  CSV Batch Ready
                </div>

                <div className="relative h-[285px] w-[200px] animate-[float_4s_ease-in-out_infinite] rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-700 p-4 shadow-2xl shadow-violet-500/35">
                  <div className="relative h-full rounded-xl border border-white/20 bg-white/15 p-4 text-left backdrop-blur-md">
                    <p className="text-[11px] font-semibold">
                      RL Constructions
                    </p>

                    <h3 className="mt-14 text-xl font-black leading-tight">
                      Invest Smart This Festival
                    </h3>

                    <p className="mt-3 text-[11px] text-white/80">
                      Personalized for Sainath Reddy
                    </p>

                    <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/25 p-2 text-center text-[11px]">
                      Call: 98765 43210
                    </div>
                  </div>
                </div>
              </section>

              <aside className="hidden border-l border-white/10 bg-[#0B1220] p-4 text-left md:block">
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/35">
                  AI Agent
                </p>

                {["Auto Today", "Hinglish", "Premium", "4K"].map((item) => (
                  <div
                    key={item}
                    className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/70"
                  >
                    {item}
                  </div>
                ))}

                <button className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 text-xs font-bold transition hover:scale-[1.02]">
                  Generate Magic
                </button>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-3xl font-black md:text-4xl">
          Built for Fast Poster Automation
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-400/40"
            >
              <div className="mb-4 h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500" />
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-3xl font-black md:text-4xl">
          Simple Workflow
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-black">
                {index + 1}
              </div>
              <p className="text-sm font-bold text-white/80">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center text-3xl font-black md:text-4xl">
          Start Small. Scale Fast.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["Starter", "For small businesses", "₹999/mo"],
            ["Professional", "For growing teams", "₹2,999/mo"],
            ["Agency", "For bulk campaigns", "Custom"],
          ].map(([plan, desc, price]) => (
            <div
              key={plan}
              className={`rounded-2xl border p-6 ${
                plan === "Professional"
                  ? "border-cyan-400/50 bg-gradient-to-br from-violet-600/20 to-cyan-500/20"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <h3 className="text-xl font-black">{plan}</h3>
              <p className="mt-2 text-sm text-white/55">{desc}</p>
              <p className="mt-5 text-3xl font-black">{price}</p>
              <button className="mt-6 w-full rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <div className="rounded-[1.7rem] border border-white/10 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 p-10">
          <h2 className="text-3xl font-black md:text-5xl">
            Start Creating Personalized Posters.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Build your first campaign using one poster and one CSV file.
          </p>

          <Link
            href="/dashboard"
            className="mt-7 inline-block rounded-xl bg-white px-7 py-3 text-sm font-bold text-black"
          >
            Go to Editor
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        © 2026 Posterly. Product • Features • Pricing • Privacy • Terms
      </footer>
    </main>
  );
}