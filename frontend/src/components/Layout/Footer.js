import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import Logo from '@/components/common/Logo';

const Footer = () => {
  const columns = [
    {
      title: 'Explore',
      links: [
        { to: '/events', label: 'Events' },
        { to: '/categories', label: 'Categories' },
        { to: '/about', label: 'About us' },
        { to: '/contact', label: 'Contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/privacy', label: 'Privacy policy' },
        { to: '/terms', label: 'Terms of service' },
        { to: '/cookies', label: 'Cookie policy' },
      ],
    },
  ];

  const socials = [
    { icon: Facebook, label: 'Facebook' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Instagram, label: 'Instagram' },
    { icon: Linkedin, label: 'LinkedIn' },
  ];

  return (
    <footer className="mt-24 border-t bg-card">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Discover, book and host events across Indore. Food walks, music nights, meetups and more.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-bold">{col.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-4 text-sm font-bold">Contact us</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@eventhub.com</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> (123) 456-7890</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Vijay Nagar, Indore, Madhya Pradesh 452010</li>
          </ul>
          <div className="mt-5 flex gap-2">
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#!"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg border bg-card shadow-soft transition-all hover:bg-muted"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t bg-secondary text-secondary-foreground">
        <p className="container py-5 text-center text-xs font-semibold">
          &copy; {new Date().getFullYear()} EventHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
