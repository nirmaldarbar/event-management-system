import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, updateEventStatus } from '@/features/events/eventSlice';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Calendar, CheckCircle, Eye, IndianRupee, TrendingUp, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import { formatINR, getEventImage, capitalize, imgFallback } from '@/lib/utils';

const COLORS = ['#6d4aff', '#ff5c7a', '#ffb020', '#14b8a6', '#38bdf8', '#a78bfa'];

const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 16,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 24px 48px -16px hsl(var(--shadow) / 0.3)',
};

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    pendingEvents: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchEvents({ limit: 1000, role: 'admin' }));
  }, [dispatch]);

  useEffect(() => {
    if (events.length > 0) {
      // Calculate stats
      const totalEvents = events.length;
      const pendingEvents = events.filter((e) => e.status === 'draft').length;

      const totalRevenue = events.reduce((sum, event) => {
        const eventRevenue = event.ticketTypes?.reduce((ticketSum, ticket) => ticketSum + ticket.price * ticket.sold, 0) || 0;
        return sum + eventRevenue;
      }, 0);

      // Generate revenue data (last 7 days). Sample data until an analytics endpoint is wired up.
      const today = new Date();
      const revenueByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: Math.floor(Math.random() * 5000) + 1000,
        };
      });

      // Generate category distribution
      const categories = {};
      events.forEach((event) => {
        categories[event.category] = (categories[event.category] || 0) + 1;
      });

      const categoryDistribution = Object.entries(categories).map(([name, value]) => ({
        name: capitalize(name),
        value,
      }));

      setStats({
        totalUsers: 1250, // Mock data
        totalEvents,
        totalRevenue,
        pendingEvents,
      });
      setRevenueData(revenueByDay);
      setCategoryData(categoryDistribution);
    }
  }, [events]);

  const visibleEvents = useMemo(
    () => events.filter((e) => statusFilter === 'all' || e.status === statusFilter).slice(0, 10),
    [events, statusFilter]
  );

  if (loading) {
    return <LoadingState fullPage label="Loading admin dashboard..." />;
  }

  const handleApprove = (eventId) => {
    dispatch(updateEventStatus({ id: eventId, status: 'published' }));
  };

  const handleReject = (eventId) => {
    dispatch(updateEventStatus({ id: eventId, status: 'cancelled' }));
  };

  const revenueOf = (event) => event.ticketTypes?.reduce((sum, ticket) => sum + ticket.price * ticket.sold, 0) || 0;

  return (
    <div className="container max-w-[88rem] py-12">
      <PageHeader title="Admin dashboard" description="System overview and management." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats.totalUsers.toLocaleString()} />
        <StatCard icon={Calendar} label="Total events" value={stats.totalEvents} tint="bg-success/10 text-success" />
        <StatCard icon={IndianRupee} label="Total revenue" value={formatINR(stats.totalRevenue)} tint="bg-primary/10 text-primary" />
        <StatCard icon={TrendingUp} label="Pending events" value={stats.pendingEvents} tint="bg-rose-500/10 text-rose-600 dark:text-rose-300" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-6 text-lg font-bold">Revenue overview (last 7 days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.6)' }}
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatINR(value), 'Revenue']}
                />
                <Bar dataKey="revenue" name="Daily revenue" fill="#6d4aff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-lg font-bold">Events by category</h2>
          <div className="h-60 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
            {categoryData.map((c, i) => (
              <li key={c.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name} ({c.value})
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-2">
          <h2 className="text-lg font-bold">Recent events</h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft (pending)</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="px-2 pb-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Event</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleEvents.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No events match this filter.</TableCell>
                </TableRow>
              )}
              {visibleEvents.map((event) => (
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
                  <TableCell className="whitespace-nowrap">{event.organizerName}</TableCell>
                  <TableCell>
                    <div className="whitespace-nowrap">{new Date(event.startDate).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={event.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {event.currentAttendees} / {event.maxAttendees || '∞'}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold">{formatINR(revenueOf(event))}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button asChild variant="outline" size="icon-sm" aria-label={`View ${event.title}`}>
                        <Link to={`/events/${event._id}`}><Eye /></Link>
                      </Button>
                      {event.status === 'draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            title="Approve"
                            aria-label={`Approve ${event.title}`}
                            className="text-success hover:bg-success/10 hover:text-success"
                            onClick={() => handleApprove(event._id)}
                          >
                            <CheckCircle />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            title="Reject"
                            aria-label={`Reject ${event.title}`}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleReject(event._id)}
                          >
                            <XCircle />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
