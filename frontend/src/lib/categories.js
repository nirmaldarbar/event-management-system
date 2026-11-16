import {
  Music, Trophy, Mic, Wrench, PartyPopper, Frame, Handshake, Heart,
  UtensilsCrossed, Palette, Cpu, Briefcase, BookOpen, HeartPulse, Sparkles,
} from "lucide-react";

// Static class names so Tailwind's JIT can see them.
export const CATEGORIES = {
  music: { label: "Music", icon: Music, tint: "bg-violet-500/10 text-violet-700 dark:text-violet-300", count: 45 },
  sports: { label: "Sports", icon: Trophy, tint: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", count: 32 },
  conference: { label: "Conference", icon: Mic, tint: "bg-sky-500/10 text-sky-700 dark:text-sky-300", count: 28 },
  workshop: { label: "Workshop", icon: Wrench, tint: "bg-amber-500/10 text-amber-700 dark:text-amber-300", count: 36 },
  festival: { label: "Festival", icon: PartyPopper, tint: "bg-rose-500/10 text-rose-700 dark:text-rose-300", count: 19 },
  exhibition: { label: "Exhibition", icon: Frame, tint: "bg-slate-500/10 text-slate-700 dark:text-slate-300", count: 14 },
  networking: { label: "Networking", icon: Handshake, tint: "bg-teal-500/10 text-teal-700 dark:text-teal-300", count: 24 },
  charity: { label: "Charity", icon: Heart, tint: "bg-pink-500/10 text-pink-700 dark:text-pink-300", count: 18 },
  food: { label: "Food & Drink", icon: UtensilsCrossed, tint: "bg-orange-500/10 text-orange-700 dark:text-orange-300", count: 22 },
  art: { label: "Art", icon: Palette, tint: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300", count: 27 },
  technology: { label: "Technology", icon: Cpu, tint: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300", count: 41 },
  business: { label: "Business", icon: Briefcase, tint: "bg-blue-500/10 text-blue-700 dark:text-blue-300", count: 33 },
  education: { label: "Education", icon: BookOpen, tint: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300", count: 29 },
  health: { label: "Health", icon: HeartPulse, tint: "bg-green-500/10 text-green-700 dark:text-green-300", count: 16 },
  other: { label: "Other", icon: Sparkles, tint: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300", count: 11 },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

export const getCategory = (key) => CATEGORIES[key] || CATEGORIES.other;
