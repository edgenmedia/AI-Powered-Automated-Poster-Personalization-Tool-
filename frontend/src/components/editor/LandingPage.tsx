"use client";

import Link from "next/link";
import { useState } from "react";

const metrics = [
  { value: "10x", label: "Faster than manual design" },
  { value: "500+", label: "Businesses using Posterly" },
  { value: "2M+", label: "Posters generated" },
  { value: "99%", label: "Satisfaction rate" },
];

const features = [
  {
    icon: "✦",
    title: "Canvas Editor",
    desc: "Drag, resize, restyle text and images on a live poster — no design software needed.",
    accent: "from-violet-500 to-purple-700",
  },
  {
    icon: "⌁",
    title: "CSV Auto-Map",
    desc: "Upload your customer list. Posterly detects name and phone columns automatically.",
    accent: "from-cyan-400 to-blue-600",
  },
  {
    icon: "◈",
    title: "AI Copy Agent",
    desc: "Generate festival-ready headlines, taglines, and CTAs tuned to your brand tone.",
    accent: "from-emerald-400 to-teal-600",
  },
  {
    icon: "⬡",
    title: "Bulk Export",
    desc: "Generate 500 personalised posters and download them as a single ZIP in seconds.",
    accent: "from-orange-400 to-rose-600",
  },
];

const testimonials = [
  {
    name: "Kiran Reddy",
    role: "Real Estate Agency, Hyderabad",
    quote:
      "We ran Diwali campaigns for 400 clients. Posterly made it a 20-minute job instead of a 3-day one.",
    avatar: "KR",
  },
  {
    name: "Priya Sharma",
    role: "Marketing Lead, FinEdge",
    quote:
      "The AI agent writes better Hinglish copy than our intern. The auto-mapping alone saves us hours every week.",
    avatar: "PS",
  },
  {
    name: "Mohammed Arif",
    role: "Founder, PrintBase",
    quote:
      "Our resellers love the white-label bulk export. We've grown 3x since switching to Posterly.",
    avatar: "MA",
  },
];

const faqs = [
  {
    q: "Do I need design skills?",
    a: "Not at all. The canvas editor works like Canva — upload your poster, click any text, and edit it directly.",
  },
  {
    q: "How large a CSV can I upload?",
    a: "Up to 10,000 rows on the Agency plan. Starter supports 500 rows per batch.",
  },
  {
    q: "Can the AI match our brand tone?",
    a: "Yes. Set your brand voice once — formal, casual, Hinglish, premium — and every generated copy follows it.",
  },
  {
    q: "What image formats are supported?",
    a: "PNG, JPG, and PDF poster uploads. Exports are high-res PNG or PDF, ready for print or WhatsApp.",
  },
];

export default function LandingV2() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080C15] text-white">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute -right-40 top-60 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[110px]" />
      </div>

      {/* Nav */}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Posterly Logo" className="h-11 w-11 " />
          <span className="text-xl font-black tracking-tight">Posterly</span>
        </div>

        <div className="hidden items-center gap-7 text-sm text-white/50 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#testimonials" className="transition hover:text-white">Stories</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-bold shadow-lg shadow-violet-500/25 transition hover:scale-105"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Copy */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-1.5 text-xs font-medium text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              New — AI Design Agent v2.0
            </div>

            <h1 className="text-5xl font-black leading-[1.1] tracking-tight md:text-6xl">
              One poster.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Thousands of names.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-white/55">
              Upload a poster, drop in a CSV, and let Posterly personalise
              each one with the right name, number, and AI-written copy — in
              under a minute.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-3.5 text-sm font-bold shadow-xl shadow-violet-500/30 transition hover:scale-105"
              >
                Start for Free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold transition hover:bg-white/10">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                </svg>
                Watch 90s Demo
              </button>
            </div>

            <p className="mt-5 text-xs text-white/30">
              No credit card required · Free plan includes 50 posters/month
            </p>
          </div>

          {/* Right: Visual poster stack */}
          <div className="relative flex items-center justify-center">
            {/* Back poster */}
            <div className="absolute -left-4 top-6 h-[300px] w-[210px] rotate-[-8deg] rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-800 opacity-50 shadow-xl" />
            {/* Mid poster */}
            <div className="absolute left-4 top-2 h-[300px] w-[210px] rotate-[-3deg] rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-700 opacity-70 shadow-xl" />

            {/* Front poster */}
            <div className="relative h-[320px] w-[225px] rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-700 shadow-2xl shadow-violet-500/40">
              <div className="absolute inset-3 rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-white/30" />
                  <span className="text-[11px] font-bold">RL Constructions</span>
                </div>
                <h3 className="mt-10 text-xl font-black leading-tight">
                  Invest Smart
                  <br />
                  This Festival
                </h3>
                <p className="mt-3 text-[11px] text-white/80">
                  Personalised for
                </p>
                <p className="text-sm font-bold">Sainath Reddy</p>
                <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/30 px-3 py-2 text-center text-[11px] font-semibold backdrop-blur">
                  📞 98765 43210
                </div>
              </div>

              {/* Badge */}
              <div className="absolute -right-4 -top-3 rounded-xl border border-white/15 bg-[#0B0F19]/80 px-3 py-2 text-[11px] font-semibold backdrop-blur">
                ✦ AI Generated
              </div>
              <div className="absolute -bottom-3 -left-4 rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-3 py-2 text-[11px] font-semibold text-emerald-300 backdrop-blur">
                CSV → 400 posters
              </div>
            </div>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="mt-20 grid grid-cols-2 gap-4 border-t border-white/8 pt-12 md:grid-cols-4">
          {metrics.map(({ value, label }) => (
            <div key={value} className="text-center">
              <p className="text-3xl font-black text-white md:text-4xl">{value}</p>
              <p className="mt-1 text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-400">
            What's inside
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {features.map(({ icon, title, desc, accent }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-xl shadow-lg`}
              >
                {icon}
              </div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-2 leading-7 text-white/50">{desc}</p>

              {/* Hover glow */}
              <div
                className={`pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br ${accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* How it works — horizontal timeline */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-400">
            How it works
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            From template to
            <br />
            campaign in 5 steps.
          </h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />

          <div className="grid gap-8 md:grid-cols-5">
            {[
              ["Open Editor", "Launch the canvas from your browser."],
              ["Upload Poster", "Drop in any PNG, JPG, or PDF."],
              ["Upload CSV", "Your customer list with name & phone."],
              ["Auto-Map", "Posterly detects columns automatically."],
              ["Export", "Download all posters as a ZIP."],
            ].map(([title, desc], i) => (
              <div key={title} className="relative text-center">
                <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-lg font-black shadow-lg shadow-violet-500/30">
                  {i + 1}
                </div>
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-white/40">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
            Customer stories
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            Teams love Posterly.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map(({ name, role, quote, avatar }) => (
            <div
              key={name}
              className="flex flex-col justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-7"
            >
              <p className="leading-7 text-white/70">"{quote}"</p>
              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-black">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-bold">{name}</p>
                  <p className="text-xs text-white/40">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-400">
            Pricing
          </p>
          <h2 className="text-4xl font-black md:text-5xl">
            Start small. Scale fast.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              plan: "Starter",
              price: "₹999",
              period: "/month",
              desc: "For small businesses and solo marketers.",
              perks: ["500 posters/month", "CSV upload up to 500 rows", "5 templates", "PNG export"],
              highlight: false,
            },
            {
              plan: "Professional",
              price: "₹2,999",
              period: "/month",
              desc: "For growing teams running regular campaigns.",
              perks: ["5,000 posters/month", "CSV upload up to 2,000 rows", "AI Copy Agent", "PDF + PNG export", "Priority support"],
              highlight: true,
            },
            {
              plan: "Agency",
              price: "Custom",
              period: "",
              desc: "For bulk campaigns and white-label resellers.",
              perks: ["Unlimited posters", "10,000+ rows per batch", "White-label export", "Dedicated manager", "API access"],
              highlight: false,
            },
          ].map(({ plan, price, period, desc, perks, highlight }) => (
            <div
              key={plan}
              className={`relative rounded-2xl border p-7 ${
                highlight
                  ? "border-cyan-400/40 bg-gradient-to-b from-violet-600/15 to-cyan-500/10"
                  : "border-white/8 bg-white/[0.03]"
              }`}
            >
              {highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-1 text-xs font-bold shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-black">{plan}</h3>
              <p className="mt-1 text-sm text-white/45">{desc}</p>
              <p className="mt-5 text-4xl font-black">
                {price}
                <span className="text-base font-medium text-white/40">{period}</span>
              </p>

              <ul className="mt-6 space-y-2.5">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-white/65">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/25 text-[9px] text-emerald-400">✓</span>
                    {p}
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={`mt-7 block w-full rounded-xl py-3 text-center text-sm font-bold transition hover:scale-[1.02] ${
                  highlight
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25"
                    : "border border-white/15 bg-white/8 hover:bg-white/12"
                }`}
              >
                {plan === "Agency" ? "Contact Sales" : "Get Started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
            FAQ
          </p>
          <h2 className="text-4xl font-black">Common questions.</h2>
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <button
              key={q}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left transition hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold">{q}</p>
                <span className={`text-white/40 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </div>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-7 text-white/55">{a}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600/25 via-[#080C15] to-cyan-500/20 p-12 text-center">
          {/* Glow orbs */}
          <div className="pointer-events-none absolute left-1/4 top-0 h-56 w-56 -translate-y-1/2 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-violet-300">
              Ready to personalise at scale?
            </p>
            <h2 className="text-4xl font-black md:text-5xl">
              Your next campaign
              <br />
              starts here.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/55">
              Join 500+ businesses creating personalised posters in minutes — not days.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:scale-105"
              >
                Open Canvas Editor
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <p className="text-xs text-white/35">Free plan · No card needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm text-white/35 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="Posterly Logo" className="h-9 w-9 object-contain rounded-lg" />
            <span className="font-black text-white/70">Posterly</span>
          </div>
          <div className="flex gap-6">
            {["Product", "Features", "Pricing", "Privacy", "Terms"].map((l) => (
              <a key={l} href="#" className="hover:text-white/70">{l}</a>
            ))}
          </div>
          <p>© 2026 Posterly. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}