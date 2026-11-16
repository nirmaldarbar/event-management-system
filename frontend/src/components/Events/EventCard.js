import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Users, Sparkles } from 'lucide-react';
import moment from 'moment';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, getEventImage, imgFallback } from '@/lib/utils';
import { getCategory } from '@/lib/categories';

const EventCard = ({ event, className }) => {
  const category = getCategory(event.category);
  const CategoryIcon = category.icon;
  const start = moment(event.startDate);
  const prices = event.ticketTypes?.map((t) => t.price) || [];
  const minPrice = prices.length ? Math.min(...prices) : null;
  const fill = event.maxAttendees ? Math.min(100, Math.round((event.currentAttendees / event.maxAttendees) * 100)) : 0;
  const ratingAvg = event.rating?.average ?? 0;
  const ratingCount = event.rating?.count ?? 0;

  return (
    <Card
      className={cn(
        'group relative flex h-full flex-col overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift',
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted">
        <img
          src={getEventImage(event)}
          alt={event.title}
          loading="lazy"
          onError={imgFallback}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 grid min-w-[3.25rem] place-items-center rounded-xl border bg-background/90 px-2.5 py-1.5 text-center shadow-soft backdrop-blur">
          <span className="font-display text-xl font-bold leading-none">{start.format('D')}</span>
          <span className="mt-0.5 text-[11px] font-bold">{start.format('MMM')}</span>
        </div>

        {event.featured && (
          <Badge variant="secondary" className="absolute right-3 top-3 bg-background/90 shadow-soft backdrop-blur">
            <Sparkles className="h-3 w-3" /> Featured
          </Badge>
        )}

        <div className="absolute bottom-3 right-3 rounded-lg border bg-background/90 px-3 py-1 text-sm font-semibold shadow-soft backdrop-blur">
          {minPrice === null ? 'Tickets TBA' : minPrice === 0 ? 'Free' : `From ₹${minPrice}`}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-bold', category.tint)}>
            <CategoryIcon className="h-3.5 w-3.5" />
            {category.label}
          </span>
          <span className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-semibold">{ratingAvg.toFixed(1)}</span>
            <span className="text-muted-foreground">({ratingCount})</span>
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
          <Link to={event.demo ? '/events' : `/events/${event._id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {event.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {event.shortDescription ||
            (event.description?.length > 100 ? `${event.description.substring(0, 100)}...` : event.description)}
        </p>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{start.format('ddd, MMM D • h:mm A')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{event.isOnline ? 'Online event' : event.venue?.name || 'Venue TBA'}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-dashed pt-4">
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="h-3 flex-1 overflow-hidden rounded-full border bg-card" aria-hidden>
            <div className="h-full bg-primary" style={{ width: `${event.maxAttendees ? fill : 8}%` }} />
          </div>
          <span className="text-xs font-bold">
            {event.currentAttendees ?? 0} / {event.maxAttendees || '∞'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export const EventCardSkeleton = () => (
  <Card className="overflow-hidden p-0">
    <div className="aspect-[16/10] animate-pulse border-b bg-muted" />
    <div className="space-y-3 p-5">
      <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
      <div className="h-5 w-4/5 animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded-lg bg-muted" />
    </div>
  </Card>
);

export default EventCard;
