import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '@/features/events/eventSlice';
import { createBooking } from '@/features/bookings/bookingSlice';
import {
  AlertCircle, ArrowLeft, Bookmark, BookmarkCheck, Calendar, Clock, ExternalLink, Loader2,
  MapPin, Minus, Plus, Share2, Star, Ticket, Users, ShieldCheck,
} from 'lucide-react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAvatar, getEventImage, getInitials, formatINR, imgFallback } from '@/lib/utils';
import { getCategory } from '@/lib/categories';

const SERVICE_FEE = 2;

const EventDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentEvent, loading, error } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState([{ name: '', email: '', phone: '' }]);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    dispatch(fetchEvent(id));
    setActiveImage(0);
    setSelectedTicket(null);
    setQuantity(1);
  }, [dispatch, id]);

  // Keep one attendee form per ticket
  useEffect(() => {
    setAttendees((prev) =>
      Array.from({ length: quantity }, (_, i) => prev[i] || { name: '', email: '', phone: '' })
    );
  }, [quantity]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!selectedTicket) {
      toast.warn('Please select a ticket type');
      return;
    }

    const bookingData = {
      eventId: id,
      ticketTypeId: selectedTicket._id,
      quantity,
      attendees: attendees.slice(0, quantity),
    };

    try {
      setBooking(true);
      await dispatch(createBooking(bookingData)).unwrap();
      toast.success('Booking created successfully!');
      navigate('/bookings');
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error('Failed to create booking: ' + (err?.message || err || 'Unknown error'));
    } finally {
      setBooking(false);
    }
  };

  const handleAttendeeChange = (index, field, value) => {
    setAttendees((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentEvent?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch (e) {
      /* user cancelled share */
    }
  };

  if (loading) {
    return (
      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-20">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle />
          <AlertTitle>Couldn't load this event</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/events')}><ArrowLeft /> Back to events</Button>
      </div>
    );
  }

  if (!currentEvent) {
    return null;
  }

  const category = getCategory(currentEvent.category);
  const CategoryIcon = category.icon;
  const images = currentEvent.images?.length ? currentEvent.images : [];
  const mainImage = images[activeImage]?.url || getEventImage(currentEvent);

  const formatDuration = (start, end) => {
    const duration = moment.duration(moment(end).diff(moment(start)));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours} hours ${minutes} minutes`;
  };

  const remaining = selectedTicket ? selectedTicket.quantity - selectedTicket.sold : 0;
  const subtotal = selectedTicket ? selectedTicket.price * quantity : 0;

  return (
    <div className="container py-8 sm:py-10">
      <Button variant="ghost" size="sm" className="mb-5 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft /> Back
      </Button>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        {/* Left column */}
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-2xl border bg-muted shadow-lift">
            <img src={mainImage} alt={currentEvent.title} onError={imgFallback} className="aspect-[16/9] w-full object-cover" />
            {currentEvent.featured && (
              <Badge className="absolute right-4 top-4 bg-warning text-warning-foreground shadow-soft">Featured</Badge>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    'h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-ring',
                    index === activeImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={image.url} alt="" onError={imgFallback} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{currentEvent.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold', category.tint)}>
                  <CategoryIcon className="h-4 w-4" />
                  {category.label}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="font-bold">{currentEvent.rating?.average?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-muted-foreground">({currentEvent.rating?.count || 0} reviews)</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}><Share2 /> Share</Button>
              <Button variant="outline" size="sm" onClick={() => setSaved((s) => !s)} aria-pressed={saved}>
                {saved ? <BookmarkCheck className="text-primary" /> : <Bookmark />} {saved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold">About this event</h2>
            <p className="mt-3 max-w-prose whitespace-pre-line leading-relaxed text-muted-foreground">
              {currentEvent.description}
            </p>
          </section>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Calendar className="h-5 w-5" /></span>
                <h3 className="font-semibold">Date & time</h3>
              </div>
              <p className="font-medium">{moment(currentEvent.startDate).format('dddd, MMMM D, YYYY')}</p>
              <p className="text-sm text-muted-foreground">{moment(currentEvent.startDate).format('h:mm A')}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {formatDuration(currentEvent.startDate, currentEvent.endDate)}
              </p>
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300"><MapPin className="h-5 w-5" /></span>
                <h3 className="font-semibold">Location</h3>
              </div>
              {currentEvent.isOnline ? (
                <>
                  <p className="font-medium">Online event</p>
                  <a
                    href={currentEvent.onlineLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline"
                  >
                    {currentEvent.onlineLink} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </>
              ) : (
                <>
                  <p className="font-medium">{currentEvent.venue?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentEvent.venue?.address?.street && `${currentEvent.venue.address.street}, `}
                    {currentEvent.venue?.address?.city}
                    {currentEvent.venue?.address?.state && `, ${currentEvent.venue.address.state}`}
                    {currentEvent.venue?.address?.zipCode && ` ${currentEvent.venue.address.zipCode}`}
                  </p>
                </>
              )}
            </Card>
          </div>

          <Card className="mt-4 p-5">
            <h3 className="mb-4 font-semibold">Organizer</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={getAvatar(currentEvent.organizer)} alt={currentEvent.organizerName} />
                <AvatarFallback>{getInitials(currentEvent.organizerName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{currentEvent.organizerName}</p>
                <p className="text-sm text-muted-foreground">{currentEvent.organizer?.bio || 'Event organizer'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Booking sidebar */}
        <aside className="lg:sticky lg:top-28">
          <Card className="p-6 shadow-lift">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Get tickets</h2>
              <Badge variant="secondary">
                <Users className="h-3.5 w-3.5" />
                {currentEvent.currentAttendees} / {currentEvent.maxAttendees || '∞'}
              </Badge>
            </div>

            <div role="radiogroup" aria-label="Ticket type" className="space-y-2.5">
              {currentEvent.ticketTypes?.map((ticket) => {
                const active = selectedTicket?._id === ticket._id;
                const left = ticket.quantity - ticket.sold;
                return (
                  <button
                    key={ticket._id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={left <= 0}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setQuantity((q) => Math.min(q, Math.max(1, left)));
                    }}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                      active ? 'border-primary bg-primary/5 shadow-glow' : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{ticket.name}</p>
                        {ticket.description && <p className="mt-0.5 text-sm text-muted-foreground">{ticket.description}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant={left <= 10 ? 'warning' : 'secondary'}>{left > 0 ? `${left} left` : 'Sold out'}</Badge>
                          {ticket.salesEndDate && <span>Sales end {moment(ticket.salesEndDate).format('MMM D')}</span>}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-display text-xl font-bold">{ticket.price === 0 ? 'Free' : formatINR(ticket.price)}</div>
                        <span className="text-xs text-muted-foreground">per ticket</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {!currentEvent.ticketTypes?.length && (
                <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Tickets aren't available yet.
                </p>
              )}
            </div>

            {selectedTicket && (
              <div className="mt-6 space-y-6">
                <div>
                  <Label>Quantity</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Button variant="outline" size="icon-sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                      <Minus />
                    </Button>
                    <span className="w-8 text-center font-display text-xl font-bold" aria-live="polite">{quantity}</span>
                    <Button variant="outline" size="icon-sm" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= remaining} aria-label="Increase quantity">
                      <Plus />
                    </Button>
                    <span className="text-sm text-muted-foreground">Max {remaining}</span>
                  </div>
                </div>

                <div>
                  <Label>Attendee information</Label>
                  <div className="mt-3 space-y-4">
                    {attendees.slice(0, quantity).map((attendee, index) => (
                      <fieldset key={index} className="space-y-2 rounded-2xl bg-muted/50 p-3">
                        <legend className="px-1 text-xs font-semibold text-muted-foreground">Attendee {index + 1}</legend>
                        <Input
                          placeholder="Full name"
                          aria-label={`Attendee ${index + 1} full name`}
                          value={attendee.name}
                          onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                          className="h-10"
                        />
                        <Input
                          type="email"
                          placeholder="Email"
                          aria-label={`Attendee ${index + 1} email`}
                          value={attendee.email}
                          onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                          className="h-10"
                        />
                        <Input
                          type="tel"
                          placeholder="Phone (optional)"
                          aria-label={`Attendee ${index + 1} phone`}
                          value={attendee.phone}
                          onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)}
                          className="h-10"
                        />
                      </fieldset>
                    ))}
                  </div>
                </div>

                <div>
                  <Separator className="mb-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatINR(SERVICE_FEE)}</span></div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-2xl font-bold text-primary">{formatINR(subtotal + SERVICE_FEE)}</span>
                  </div>
                </div>

                <Button size="lg" variant="gradient" className="w-full" onClick={handleBooking} disabled={booking}>
                  {booking ? <Loader2 className="animate-spin" /> : <Ticket />} {booking ? 'Booking...' : 'Book now'}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout
                </p>
              </div>
            )}

            {!selectedTicket && currentEvent.ticketTypes?.length > 0 && (
              <p className="mt-5 text-center text-sm text-muted-foreground">Select a ticket type to continue.</p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default EventDetailPage;
