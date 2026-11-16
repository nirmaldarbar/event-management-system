import { CalendarCheck, QrCode, BellRing } from "lucide-react";
import Logo from "@/components/common/Logo";
import ParticleField from "@/components/common/ParticleField";

const perks = [
  { icon: CalendarCheck, title: "Book in a few taps", text: "Pick a ticket, add attendees, done." },
  { icon: QrCode, title: "Skip the queue", text: "Every booking gets a QR pass for check-in." },
  { icon: BellRing, title: "Never miss a beat", text: "Live notifications for the events you follow." },
];

export default function AuthLayout({ children, wide = false }) {
  return (
    <div className="grid min-h-[calc(100vh-5.25rem)] lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1020] p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[110px]" />
        <ParticleField className="absolute inset-0 h-full w-full" />

        <Logo className="relative text-white" />
        <div className="relative">
          <h2 className="max-w-md text-balance font-display text-4xl font-bold leading-tight">
            Every great night in Indore starts with a ticket.
          </h2>
          <ul className="mt-10 space-y-6">
            {perks.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">Trusted by 20K+ attendees and 150+ organizers.</p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className={(wide ? "max-w-xl" : "max-w-md") + " w-full rounded-3xl border bg-card/90 p-6 shadow-lift backdrop-blur sm:p-8"}>{children}</div>
      </div>
    </div>
  );
}
