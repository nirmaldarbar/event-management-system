import { IMG } from "@/lib/images";

// Sample events shown on the home page when the API has no featured events yet.
// They are marked `demo: true` so cards link to /events instead of a detail page.
const base = { demo: true, featured: true, isOnline: false, maxAttendees: 500, ticketTypes: [] };
const days = (n, h = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

export const DEMO_EVENTS = [
  {
    ...base, _id: "demo-1", title: "Sarafa Night Food Walk", category: "food",
    shortDescription: "A guided late-night tasting walk through the famous Sarafa night market.",
    startDate: days(2, 20), venue: { name: "Sarafa Bazaar", address: { city: "Indore" } }, rating: { average: 4.9, count: 530 },
    currentAttendees: 41, maxAttendees: 60, images: [{ url: IMG.food, isMain: true }], ticketTypes: [{ price: 299 }],
  },
  {
    ...base, _id: "demo-2", title: "Winter Music Night at Meghdoot Garden", category: "music",
    shortDescription: "An open-air evening of live bands and acoustic sets with food stalls.",
    startDate: days(9, 19), venue: { name: "Meghdoot Garden", address: { city: "Indore" } }, rating: { average: 4.8, count: 214 },
    currentAttendees: 342, maxAttendees: 460, images: [{ url: IMG.concert, isMain: true }], ticketTypes: [{ price: 499 }],
  },
  {
    ...base, _id: "demo-3", title: "Poha-Jalebi Sunday Breakfast Fest", category: "food",
    shortDescription: "The city's favourite breakfast, 20 stalls, live music and a kids corner.",
    startDate: days(6, 8), venue: { name: "Nehru Park", address: { city: "Indore" } }, rating: { average: 4.8, count: 312 },
    currentAttendees: 478, maxAttendees: 800, images: [{ url: IMG.party, isMain: true }], ticketTypes: [{ price: 0 }],
  },
];
