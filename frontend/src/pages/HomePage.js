import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeaturedEvents } from '@/features/events/eventSlice';
import {
  ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Compass, MapPin, QrCode, Search, ShieldCheck, Star, Ticket, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EventCard from '@/components/Events/EventCard';
import DemoNote from '@/components/common/DemoNote';
import ParticleField from '@/components/common/ParticleField';
import { CATEGORIES, CATEGORY_KEYS } from '@/lib/categories';
import { CATEGORY_IMAGES } from '@/lib/images';
import { DEMO_EVENTS } from '@/lib/demoEvents';
import { cn } from '@/lib/utils';

const BENTO = ['music', 'technology', 'food', 'sports', 'festival'];

const stats = [
  { value: '500+', label: 'Events hosted' },
  { value: '20K+', label: 'Happy attendees' },
  { value: '150+', label: 'Organizers' },
  { value: '4.8', label: 'Average rating' },
];

const spots = [
  { name: 'Sarafa Bazaar', tag: 'Night food walks', q: 'Sarafa' },
  { name: 'Rajwada', tag: 'Heritage & old city', q: 'Rajwada' },
  { name: 'Chhappan Dukan', tag: 'Chai & chaat fests', q: '56 dukan' },
  { name: 'Meghdoot Garden', tag: 'Live music nights', q: 'Meghdoot' },
  { name: 'Crystal IT Park', tag: 'Tech meetups', q: 'Crystal IT Park' },
  { name: 'Pipliyapala', tag: 'Sunrise runs', q: 'Pipliyapala' },
];

const steps = [
  { icon: Compass, title: 'Discover', text: 'Filter by category, date or price and find what fits your week.' },
  { icon: Ticket, title: 'Book', text: 'Pick a ticket type, add attendees and confirm in a few taps.' },
  { icon: QrCode, title: 'Check in', text: 'Show the QR pass on your booking at the door. That is it.' },
];

const testimonials = [
  { name: 'Riya S.', role: 'Attendee', text: 'Booked three events in one evening. The QR check-in made entry painless.' },
  { name: 'Karan M.', role: 'Organizer', text: 'Setting up ticket types took minutes, and I could see revenue live on the dashboard.' },
  { name: 'Neha P.', role: 'Community lead', text: 'Our meetup sold out in two days. Reminders and notifications just worked.' },
];

const Img = ({ src, alt = '', className }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
    className={cn('h-full w-full object-cover', className)}
  />
);

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredEvents } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchFeaturedEvents());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/events?search=${encodeURIComponent(query.trim())}` : '/events');
  };

  const showingDemo = !featuredEvents || featuredEvents.length === 0;
  const featured = showingDemo ? DEMO_EVENTS : featuredEvents.slice(0, 3);
  const marquee = [...CATEGORY_KEYS, ...CATEGORY_KEYS];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <ParticleField
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 55%, hsl(var(--background)) 100%)' }}
        />

        <div className="container relative grid items-center gap-14 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
          <div>
            <span className="sticker">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Now live in Indore
            </span>

            <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.04] sm:text-6xl xl:text-7xl">
              Events worth <span className="text-gradient">leaving the couch</span> for.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Everything happening in Indore: food walks at Sarafa, live music, tech meetups, runs and workshops. Book your pass in seconds, or host your own event.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-9 flex max-w-xl items-center gap-2 rounded-2xl border bg-card/90 p-1.5 pl-4 shadow-lift backdrop-blur"
            >
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, places, tags..."
                aria-label="Search events"
                className="h-11 min-w-0 flex-1 bg-transparent px-1 placeholder:text-muted-foreground focus:outline-none"
              />
              <Button type="submit" size="lg" variant="gradient">Search</Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Trending:</span>
              {['music', 'technology', 'food', 'workshop'].map((key) => (
                <Link
                  key={key}
                  to={`/events?category=${key}`}
                  className="rounded-full border bg-card/70 px-3.5 py-1 text-sm font-medium backdrop-blur transition-colors hover:bg-muted"
                >
                  {CATEGORIES[key].label}
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Secure booking</span>
              <span className="flex items-center gap-2"><QrCode className="h-4 w-4 text-primary" /> Instant QR pass</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 20K+ attendees</span>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto hidden h-[38rem] w-full max-w-md lg:block">
            <div className="absolute left-0 top-10 w-[17rem] -rotate-2 transition-transform duration-500 hover:rotate-0">
              <EventCard event={DEMO_EVENTS[0]} />
            </div>
            <div className="absolute bottom-0 right-0 w-[17rem] rotate-2 transition-transform duration-500 hover:rotate-0">
              <EventCard event={DEMO_EVENTS[1]} />
            </div>
            <div className="absolute right-0 top-0 flex animate-float-y items-center gap-3 rounded-2xl border bg-card/90 px-4 py-3 shadow-lift backdrop-blur" style={{ '--r': '0deg' }}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold leading-none">Booking confirmed</p>
                <p className="mt-1 text-xs text-muted-foreground">Pass sent to your account</p>
              </div>
            </div>
            <div className="absolute bottom-6 left-0 flex animate-float-y items-center gap-2 rounded-full border bg-card/90 px-4 py-2 text-sm font-medium shadow-lift backdrop-blur" style={{ '--r': '0deg', animationDelay: '1.5s' }}>
              <MapPin className="h-4 w-4 text-primary" /> Indore, MP
            </div>
          </div>
        </div>
      </section>

      {/* Category marquee */}
      <div className="relative overflow-hidden border-y bg-card/40 py-4 backdrop-blur [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-3 [animation-duration:60s] hover:[animation-play-state:paused]">
          {marquee.map((key, i) => {
            const Icon = CATEGORIES[key].icon;
            return (
              <Link
                key={`${key}-${i}`}
                to={`/events?category=${key}`}
                className="flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" /> {CATEGORIES[key].label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <section className="container py-16">
        <Card className="grid grid-cols-2 divide-x divide-y overflow-hidden bg-card/80 backdrop-blur md:grid-cols-4 md:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-8 text-center">
              <div className="font-display text-4xl font-bold">{s.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </Card>
      </section>

      {/* Popular spots in Indore */}
      <section className="container pb-16">
        <h2 className="text-3xl font-bold sm:text-5xl">Popular spots in Indore</h2>
        <p className="mt-2 text-muted-foreground">Find what's on around the places everyone knows.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {spots.map((sp) => (
            <Link
              key={sp.name}
              to={`/events?search=${encodeURIComponent(sp.q)}`}
              className="group flex items-center justify-between rounded-2xl border bg-card/80 p-5 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
            >
              <div>
                <p className="font-display text-lg font-semibold leading-tight">{sp.name}</p>
                <p className="text-sm text-muted-foreground">{sp.tag}</p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Category bento with photos */}
      <section className="container pb-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold sm:text-5xl">Pick your scene</h2>
            <p className="mt-2 text-muted-foreground">Jump straight to the kind of event you're in the mood for.</p>
          </div>
          <Button asChild variant="outline"><Link to="/categories">All categories <ArrowRight /></Link></Button>
        </div>

        <div className="grid auto-rows-[11rem] grid-cols-2 gap-4 md:grid-cols-4">
          {BENTO.map((key, i) => {
            const c = CATEGORIES[key];
            const Icon = c.icon;
            return (
              <Link
                key={key}
                to={`/events?category=${key}`}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/60 to-[hsl(262_70%_45%)] shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring',
                  i === 0 && 'col-span-2 row-span-2'
                )}
              >
                <Img src={CATEGORY_IMAGES[key]} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                  <div>
                    <span className="mb-2 inline-grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur"><Icon className="h-4 w-4" /></span>
                    <h3 className={cn('font-display font-semibold', i === 0 ? 'text-3xl' : 'text-xl')}>{c.label}</h3>
                    <p className="text-sm text-white/75">{c.count} events</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold sm:text-5xl">Happening soon</h2>
              <p className="mt-2 text-muted-foreground">Hand-picked events you don't want to miss.</p>
            </div>
            <Button asChild variant="outline"><Link to="/events">View all <ArrowRight /></Link></Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
          {showingDemo && <DemoNote />}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold sm:text-5xl">From browsing to the front door in three steps</h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <Card className="relative h-full overflow-hidden bg-card/80 p-7 backdrop-blur">
                <span className="absolute -right-1 -top-5 font-display text-8xl font-bold text-primary/[0.07]">{i + 1}</span>
                <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-[hsl(262_70%_52%)] text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-5 text-xl font-semibold">{title}</h3>
                <p className="relative mt-2 text-muted-foreground">{text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Testimonials */}
      <section className="container pb-20">
        <h2 className="mb-10 text-3xl font-bold sm:text-5xl">People like showing up with us</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="flex flex-col bg-card/80 p-7 backdrop-blur">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
              </div>
              <p className="mt-4 flex-1 text-lg leading-relaxed">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-[hsl(262_70%_52%)] text-sm font-bold text-white">{t.name[0]}</span>
                <div>
                  <p className="text-sm font-semibold leading-none">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0b1020] p-8 text-white shadow-lift sm:p-14">
          <ParticleField className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-indigo-500/35 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-[100px]" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-balance text-3xl font-bold sm:text-5xl">Ready to host your own event in Indore?</h2>
              <p className="mt-4 text-lg text-white/70">Create an event, set ticket types and watch bookings roll in.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-[#0b1020] hover:bg-white/90">
                <Link to="/create-event"><CalendarDays /> Create event</Link>
              </Button>
              {!user && (
                <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <Link to="/register">Sign up free</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
