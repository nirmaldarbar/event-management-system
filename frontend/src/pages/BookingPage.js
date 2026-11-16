import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, cancelBooking, updatePaymentStatus } from '@/features/bookings/bookingSlice';
import {
  Calendar, CheckCircle, Clock, CreditCard, Download, MapPin, Ticket, Users, X, XCircle, TicketCheck, TicketX, AlertTriangle,
} from 'lucide-react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { formatINR } from '@/lib/utils';
import { downloadPass } from '@/lib/pass';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'paid', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
];

const STATUS_MAP = {
  pending: { variant: 'warning', label: 'Pending' },
  paid: { variant: 'success', label: 'Confirmed' },
  failed: { variant: 'destructive', label: 'Failed' },
  refunded: { variant: 'default', label: 'Refunded' },
  cancelled: { variant: 'secondary', label: 'Cancelled' },
};

const BookingPage = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleCancelBooking = async () => {
    if (selectedBooking && cancelReason) {
      try {
        await dispatch(cancelBooking({ id: selectedBooking._id, reason: cancelReason })).unwrap();
        toast.success('Booking cancelled');
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason('');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        toast.error('Could not cancel this booking');
      }
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(booking.event?.startDate) > new Date();
    if (filter === 'past') return new Date(booking.event?.startDate) <= new Date();
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return booking.paymentStatus === filter;
  });

  const getStatusBadge = (booking) => {
    const { variant, label } = STATUS_MAP[booking.paymentStatus] || { variant: 'secondary', label: 'Unknown' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const [payingId, setPayingId] = useState(null);

  // Demo checkout: marks the booking as paid so the full flow can be tried without Stripe.
  const handlePayNow = async (booking) => {
    try {
      setPayingId(booking._id);
      await dispatch(
        updatePaymentStatus({
          id: booking._id,
          paymentData: { paymentStatus: 'paid', paymentMethod: 'cash', paymentId: `DEMO-${Date.now()}` },
        })
      ).unwrap();
      toast.success('Payment confirmed. Your ticket is ready!');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const [downloadingId, setDownloadingId] = useState(null);

  // Generates a PDF pass (one per attendee) with the booking's QR code
  const handleDownloadPass = async (booking) => {
    try {
      setDownloadingId(booking._id);
      await downloadPass(booking);
      toast.success('Pass downloaded');
    } catch (error) {
      console.error('Pass generation failed:', error);
      toast.error('Could not generate the pass');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <LoadingState fullPage label="Loading bookings..." />;
  }

  return (
    <div className="container py-12">
      <PageHeader title="My bookings" description="Manage and view your event bookings." />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Ticket} label="Total bookings" value={bookings.length} />
        <StatCard
          icon={TicketCheck}
          label="Confirmed"
          value={bookings.filter((b) => b.paymentStatus === 'paid').length}
          tint="bg-success/10 text-success"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={bookings.filter((b) => b.paymentStatus === 'pending').length}
          tint="bg-warning/15 text-warning-foreground"
        />
        <StatCard
          icon={TicketX}
          label="Cancelled"
          value={bookings.filter((b) => b.status === 'cancelled').length}
          tint="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter bookings">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'outline'}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bookings found"
          description={filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings found.`}
          action={<Button asChild><Link to="/events">Browse events</Link></Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredBookings.map((booking) => {
            const canCancel =
              booking.paymentStatus === 'paid' &&
              booking.status !== 'cancelled' &&
              new Date(booking.event?.startDate) > new Date();

            return (
              <Card key={booking._id} className="flex flex-col overflow-hidden">
                <div className="flex items-start justify-between gap-3 p-6 pb-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">{booking.event?.title || 'Event'}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {getStatusBadge(booking)}
                      {booking.checkInStatus && (
                        <Badge variant="success"><CheckCircle className="h-3 w-3" /> Checked in</Badge>
                      )}
                    </div>
                  </div>
                  <code className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">{booking.ticketNumber}</code>
                </div>

                <div className="grid flex-1 gap-4 px-6 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {moment(booking.event?.startDate).format('ddd, MMM D • h:mm A')}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {booking.event?.isOnline ? 'Online event' : booking.event?.venue?.name}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      {booking.quantity} × {booking.ticketType?.name || 'General Admission'}
                    </div>
                  </div>

                  {booking.ticketNumber && (
                    <div className="flex flex-col items-center rounded-2xl border bg-white p-3">
                      <QRCodeSVG value={booking.ticketNumber} size={84} />
                      <span className="mt-2 text-[11px] font-medium text-neutral-500">
                        {booking.paymentStatus === 'paid' ? 'Scan for check-in' : 'Valid after payment'}
                      </span>
                    </div>
                  )}
                </div>

                {booking.attendees?.length > 0 && (
                  <div className="mx-6 mt-5 rounded-2xl bg-muted/50 p-4">
                    <h4 className="mb-2 text-sm font-semibold">Attendees</h4>
                    <ul className="space-y-1.5">
                      {booking.attendees.map((attendee, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{attendee.name} • {attendee.email}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4">
                  <div>
                    <div className="font-display text-xl font-bold">{formatINR(booking.totalAmount || 0)}</div>
                    <p className="text-xs text-muted-foreground">Booked {moment(booking.createdAt).fromNow()}</p>
                  </div>
                  <div className="flex gap-2">
                    {booking.paymentStatus === 'paid' && booking.status !== 'cancelled' && (
                      <Button size="sm" variant="gradient" onClick={() => handleDownloadPass(booking)} disabled={downloadingId === booking._id}>
                        <Download /> {downloadingId === booking._id ? 'Creating...' : 'Download pass'}
                      </Button>
                    )}
                    {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
                      <Button size="sm" onClick={() => handlePayNow(booking)} disabled={payingId === booking._id}>
                        <CreditCard /> {payingId === booking._id ? 'Paying...' : 'Pay now'}
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                      >
                        <X /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              {selectedBooking?.event?.title} • {moment(selectedBooking?.event?.startDate).format('MMMM D, YYYY • h:mm A')}
            </DialogDescription>
          </DialogHeader>

          <Alert variant="warning">
            <AlertTriangle />
            <AlertDescription>
              Cancellations may be subject to fees according to the event's cancellation policy.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for cancellation <span className="text-destructive">*</span></Label>
            <Textarea
              id="cancel-reason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell the organizer why you're cancelling..."
            />
          </div>

          <p className="text-sm">
            <span className="font-semibold">Refund amount:</span> {formatINR(selectedBooking?.totalAmount || 0)}
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>Keep booking</Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={!cancelReason.trim()}>
              <XCircle /> Confirm cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingPage;
