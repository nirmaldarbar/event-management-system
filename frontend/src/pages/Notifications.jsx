import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BellOff, CheckCheck, Trash2 } from 'lucide-react';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/features/notifications/notificationSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { cn } from '@/lib/utils';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="container max-w-3xl py-14">
      <PageHeader
        title="Notifications"
        description="Updates about your bookings and the events you follow."
        actions={
          <Button variant="outline" onClick={() => dispatch(markAllAsRead())} disabled={!hasUnread}>
            <CheckCheck /> Mark all as read
          </Button>
        }
      />

      {loading && notifications.length === 0 ? (
        <LoadingState label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" description="When something happens, you'll see it here." />
      ) : (
        <Card className="divide-y overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={cn('flex items-start gap-3 px-5 py-4 transition-colors', !n.read && 'bg-primary/5')}
            >
              <span className={cn('mt-2 h-2.5 w-2.5 shrink-0 rounded-full', n.read ? 'bg-border' : 'bg-primary')} aria-hidden />
              <button
                type="button"
                className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => dispatch(markAsRead(n._id))}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{n.title}</span>
                  {!n.read && <Badge>New</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => dispatch(deleteNotification(n._id))}
                aria-label="Delete notification"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default Notifications;
