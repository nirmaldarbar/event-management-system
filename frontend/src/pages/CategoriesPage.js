import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import { CATEGORIES, CATEGORY_KEYS } from '@/lib/categories';
import { cn } from '@/lib/utils';

const CategoriesPage = () => {
  return (
    <div className="container py-14">
      <PageHeader
        align="center"
        title="Browse by category"
        description="Discover events that match your interests and passions."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {CATEGORY_KEYS.map((key) => {
          const c = CATEGORIES[key];
          const Icon = c.icon;
          return (
            <Link
              key={key}
              to={`/events?category=${key}`}
              className="group flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', c.tint)}>
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h3 className="font-display text-xl font-bold">{c.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.count} events</p>
              </div>
              <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary">
                Browse events
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Button asChild size="lg" variant="gradient">
          <Link to="/events">View all events</Link>
        </Button>
      </div>
    </div>
  );
};

export default CategoriesPage;
