import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyEvents } from '@/features/events/eventSlice';
import { fetchBookings } from '@/features/bookings/bookingSlice';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Calendar, Edit, Eye, IndianRupee, Plus, TrendingUp, Users, Ticket, UserCog, Compass, LayoutGrid,
} from 'lucide-react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import api from '@/services/api';
import { formatINR, getEventImage, capitalize, imgFallback } from '@/lib/utils';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { myEvents, loading: eventsLoading } = useSelector((state) => state.events);
  const { loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateLocalStats = React.useCallback(() => {
    if (myEvents.length > 0) {
      const totalEvents = myEvents.length;
      const upcomingEvents = myEvents.filter(
        (event) => new Date(event.startDate) > new Date() && event.status === 'published'
      ).length;
      const totalAttendees = myEvents.reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
      const totalRevenue = myEvents.reduce((sum, event) => {
        const eventRevenue =
          event.ticketTypes?.reduce((ticketSum, ticket) => ticketSum + ticket.price * (ticket.sold || 0), 0) || 0;
        return sum + eventRevenue;
      }, 0);

      setStats({ totalEvents, totalAttendees, totalRevenue, upcomingEvents });
    }
  }, [myEvents]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/dashboard/stats');
        const serverStats = response.data?.data?.stats;
        if (serverStats) {
          setStats(serverStats);
        } else {
          calculateLocalStats();
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Could not load dashboard stats. Using local data.');
        // Fallback to local calculation
        calculateLocalStats();
      } finally {
        setLoading(false);
      }
    };

    dispatch(fetchMyEvents());
    dispatch(fetchBookings());
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const eventRevenue = (event) =>
    event.ticketTypes?.reduce((sum, ticket) => sum + ticket.price * (ticket.sold || 0), 0) || 0;

  if ((loading || eventsLoading || bookingsLoading) && myEvents.length === 0) {
    return <LoadingState fullPage label="Loading dashboard..." />;
  }

  const quickActions = [
    { to: '/events', label: 'Browse events', icon: Compass },
    { to: '/bookings', label: 'View bookings', icon: Ticket },
    { to: '/profile', label: 'Edit profile', icon: UserCog },
    { to: '/categories', label: 'Browse by category', icon: LayoutGrid },
  ];

  return (
    <div className="container py-12">
      <PageHeader
        title="Organizer dashboard"
        description={`Welcome back, ${user?.name}! Manage your events and track performance.`}
        actions={
          <Button asChild variant="gradient">
            <Link to="/create-event"><Plus /> Create new event</Link>
          </Button>
        }
      />

      {error && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Calendar} label="Total events" value={stats.totalEvents} />
        <StatCard icon={Users} label="Total attendees" value={stats.totalAttendees} tint="bg-success/10 text-success" />
        <StatCard icon={IndianRupee} label="Total revenue" value={formatINR(stats.totalRevenue)} tint="bg-primary/10 text-primary" />
        <StatCard icon={TrendingUp} label="Upcoming events" value={stats.upcomingEvents} tint="bg-rose-500/10 text-rose-600 dark:text-rose-300" />
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(({ to, label, icon: Icon }) => (
          <Link
            key={to + label}
            to={to}
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 font-semibold shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </span>
            {label}
          </Link>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-bold">Recent events</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/events">View all</Link></Button>
        </div>

        {myEvents.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Calendar}
              title="No events created yet"
              description="Create your first event and start selling tickets."
              action={<Button asChild><Link to="/create-event">Create your first event</Link></Button>}
            />
          </div>
        ) : (
          <div className="px-2 pb-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myEvents.slice(0, 5).map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>
                      <div className="flex min-w-[14rem] items-center gap-3">
                        <img src={getEventImage(event)} alt="" onError={imgFallback} className="h-11 w-16 rounded-lg border object-cover" />
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{capitalize(event.category)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-nowrap">{moment(event.startDate).format('MMM D, YYYY')}</div>
                      <div className="text-xs text-muted-foreground">{moment(event.startDate).format('h:mm A')}</div>
                    </TableCell>
                    <TableCell><StatusBadge status={event.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {event.currentAttendees || 0} / {event.maxAttendees || '∞'}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-semibold">{formatINR(eventRevenue(event))}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button asChild variant="outline" size="icon-sm" aria-label={`View ${event.title}`}>
                          <Link to={`/events/${event._id}`}><Eye /></Link>
                        </Button>
                        <Button asChild variant="outline" size="icon-sm" aria-label={`Edit ${event.title}`}>
                          <Link to={`/events/${event._id}/edit`}><Edit /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
