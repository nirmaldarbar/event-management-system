import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, LogOut, Menu, Ticket, User, LayoutDashboard, ShieldCheck, Plus } from 'lucide-react';
import { logout } from '@/features/auth/authSlice';
import { fetchNotifications } from '@/features/notifications/notificationSlice';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import { cn, getAvatar, getInitials } from '@/lib/utils';

const navLinkClass = ({ isActive }) =>
  cn(
    'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
  );

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const links = [
    { to: '/events', label: 'Events' },
    { to: '/categories', label: 'Categories' },
    ...(user?.role === 'organizer' ? [{ to: '/organizer/dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin/dashboard', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 h-[5.25rem] px-3 pt-3 sm:px-5">
      <div className="glass mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-2xl pl-4 pr-2.5 shadow-soft sm:pl-5">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
                <Link to="/bookings"><Ticket /> My bookings</Link>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell />
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold leading-none text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[22rem] max-w-[calc(100vw-2rem)]">
                  <div className="flex items-center justify-between px-5 pb-2 pt-4">
                    <h3 className="font-display text-base font-semibold">Notifications</h3>
                    {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} new</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto px-2 pb-2">
                    {notifications.length === 0 ? (
                      <p className="px-3 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n._id} className="flex gap-3 rounded-2xl px-3 py-2.5 hover:bg-muted/60">
                          <span
                            className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-border' : 'bg-primary')}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{n.title}</p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t p-2">
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to="/notifications">View all notifications</Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-xl border border-transparent p-1 pr-3 transition-colors hover:border-border hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getAvatar(user)} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[7rem] truncate text-sm font-semibold sm:block">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="truncate">{user.name}</div>
                    <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/profile"><User /> Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/bookings"><Ticket /> My bookings</Link></DropdownMenuItem>
                  {(user.role === 'organizer' || user.role === 'admin') && (
                    <DropdownMenuItem asChild><Link to="/create-event"><Plus /> Create event</Link></DropdownMenuItem>
                  )}
                  {user.role === 'organizer' && (
                    <DropdownMenuItem asChild><Link to="/organizer/dashboard"><LayoutDashboard /> Dashboard</Link></DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild><Link to="/admin/dashboard"><ShieldCheck /> Admin</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link to="/register">Sign up</Link></Button>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu />
            </Button>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                {links.map((l) => (
                  <SheetClose asChild key={l.to}>
                    <NavLink to={l.to} className={({ isActive }) => cn(navLinkClass({ isActive }), 'text-base')}>
                      {l.label}
                    </NavLink>
                  </SheetClose>
                ))}
                {user ? (
                  <SheetClose asChild>
                    <NavLink to="/bookings" className={({ isActive }) => cn(navLinkClass({ isActive }), 'text-base')}>
                      My bookings
                    </NavLink>
                  </SheetClose>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    <SheetClose asChild><Button asChild variant="outline"><Link to="/login">Log in</Link></Button></SheetClose>
                    <SheetClose asChild><Button asChild><Link to="/register">Sign up</Link></Button></SheetClose>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
