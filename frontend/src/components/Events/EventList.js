import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, fetchFeaturedEvents } from '@/features/events/eventSlice';
import { Search, SearchX, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Pagination } from '@/components/ui/pagination';
import EmptyState from '@/components/common/EmptyState';
import EventCard, { EventCardSkeleton } from './EventCard';
import EventFilters from './EventFilters';

const EventList = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { events, featuredEvents, loading, error, pagination } = useSelector((state) => state.events);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [price, setPrice] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    status: 'published',
    featured: '',
    startDate: '',
    endDate: '',
    sort: '-createdAt',
    page: 1,
    limit: 12,
    ...(searchParams.get('search') ? { search: searchParams.get('search') } : {}),
  });

  useEffect(() => {
    dispatch(fetchEvents(filters));
    dispatch(fetchFeaturedEvents());
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // The API has no price filter yet, so price is applied to the events on the current page.
  const visibleEvents = useMemo(() => {
    if (price === 'all') return events;
    return events.filter((ev) => {
      const prices = ev.ticketTypes?.map((t) => t.price) || [];
      const min = prices.length ? Math.min(...prices) : 0;
      return price === 'free' ? min === 0 : min > 0;
    });
  }, [events, price]);

  if (error) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn't load events</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const filterPanel = (
    <EventFilters filters={filters} onFilterChange={handleFilterChange} price={price} onPriceChange={setPrice} />
  );

  return (
    <div>
      {/* Header + search */}
      <section className="relative overflow-hidden border-b bg-muted/30">
        <div className="container py-14 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            What's on in <span className="text-gradient">Indore</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Everything on in Indore: food walks, music, meetups, runs and workshops. Search by name, place or tag.
          </p>
          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border bg-card p-1.5 pl-5 text-foreground shadow-lift">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              aria-label="Search events"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      <div className="container py-10">
        {/* Featured */}
        {featuredEvents.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold">
              <Sparkles className="h-6 w-6 text-warning" /> Featured events
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <aside className="hidden lg:block">
            <Card className="sticky top-28 p-6">{filterPanel}</Card>
          </aside>

          <section>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">All events</h2>
                <p className="text-sm text-muted-foreground">
                  {price === 'all' ? pagination.total : visibleEvents.length} events found
                </p>
              </div>
              <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal /> Filters
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : visibleEvents.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No events found"
                description="Try adjusting your filters or search terms."
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination page={filters.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader><SheetTitle className="sr-only">Filters</SheetTitle></SheetHeader>
          <div className="mt-6">{filterPanel}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EventList;
