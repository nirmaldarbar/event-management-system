/*
 * Demo data: 3 users (admin / organizer / attendee) and 12 published Indore events.
 *   npm run seed           add demo data (skips what already exists)
 *   npm run seed -- --reset   remove previous demo data first
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User.model');
const Event = require('./models/Event.model');
const Notification = require('./models/Notification.model');

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=75`;
const IMG = {
  concert: img('photo-1470229722913-7c0e2dbbafd3'),
  tech: img('photo-1505373877841-8d25f7d46678'),
  food: img('photo-1414235077428-338989a2e8c0'),
  sports: img('photo-1461896836934-ffe607ba8211'),
  festival: img('photo-1459749411175-04bf5292ceea'),
  workshop: img('photo-1517457373958-b7bdd4587205'),
  networking: img('photo-1522071820081-009f0129c71c'),
  conference: img('photo-1511578314322-379afb476865'),
  party: img('photo-1492684223066-81342ee5ff30'),
};

const USERS = [
  { name: 'Admin', email: 'admin@eventhub.com', password: 'Admin@123', role: 'admin' },
  { name: 'Aarav Mehta', email: 'organizer@eventhub.com', password: 'Organizer@123', role: 'organizer' },
  { name: 'Riya Sharma', email: 'user@eventhub.com', password: 'User@123', role: 'user' },
];

const inDays = (n, hour = 18, lengthHours = 3) => {
  const start = new Date();
  start.setDate(start.getDate() + n);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + lengthHours * 3600 * 1000);
  return { startDate: start, endDate: end };
};

const salesEnd = (n) => new Date(Date.now() + n * 24 * 3600 * 1000);

// Sample Indore events (illustrative demo data) set at well-known places in the city.
const EVENTS = () => [
  { title: 'Sarafa Night Food Walk', category: 'food', featured: true, days: 2, hour: 20, venue: ['Sarafa Bazaar', 'Rajwada'], img: IMG.food,
    short: 'A guided late-night tasting walk through the famous Sarafa night market.',
    desc: 'Sarafa turns from a jewellery market into a food street after dark. Walk with a local guide and taste bhutte ka kees, garadu, malpua, jalebi and more. Eight tasting stops, small groups, vegetarian friendly.',
    tickets: [['Tasting walk', '8 tasting stops with guide', 299, 60]], rating: [4.9, 530], tags: ['sarafa', 'rajwada', 'street food'] },
  { title: 'Rajwada Heritage Walk', category: 'exhibition', days: 4, hour: 7, venue: ['Rajwada Palace', 'Rajwada'], img: IMG.crowd,
    short: 'A morning walk through the Holkar-era streets and markets around Rajwada.',
    desc: 'Learn the story of the Holkar dynasty and old Indore on a relaxed 90 minute walk around Rajwada, Kanch Mandir and the old markets. Ends with poha-jalebi.',
    tickets: [['Walk', 'Guide + breakfast', 149, 40]], rating: [4.7, 88], tags: ['rajwada', 'heritage', 'walk'] },
  { title: 'Poha-Jalebi Sunday Breakfast Fest', category: 'food', featured: true, days: 6, hour: 8, venue: ['Nehru Park', 'Indore'], img: IMG.party,
    short: 'The city\'s favourite breakfast, 20 stalls, live music and a kids corner.',
    desc: 'Indore starts its Sundays with poha and jalebi. Twenty stalls, filter coffee, live acoustic music and a kids corner. Free entry, pay per plate.',
    tickets: [['Entry', 'Free entry', 0, 800]], rating: [4.8, 312], tags: ['poha', 'jalebi', 'breakfast'] },
  { title: 'Chhappan Dukan Chai & Chaat Festival', category: 'food', days: 8, hour: 17, venue: ['Chhappan Dukan (56 Dukan)', 'Palasia'], img: IMG.festival,
    short: 'Evening chai, chaat and live music at Indore\'s iconic food street.',
    desc: 'Chai tasting, chaat counters and an open-air acoustic set at 56 Dukan. Come with friends and plan to stay for dinner.',
    tickets: [['Entry', 'Free entry', 0, 600], ['Chai pass', '5 chai tastings', 199, 150]], rating: [4.6, 142], tags: ['56 dukan', 'chai', 'chaat'] },
  { title: 'Winter Music Night at Meghdoot Garden', category: 'music', featured: true, days: 9, hour: 19, venue: ['Meghdoot Garden', 'Vijay Nagar'], img: IMG.concert,
    short: 'An open-air evening of live bands and acoustic sets with food stalls.',
    desc: 'Five live acts under the winter sky at Meghdoot Garden. Gates open at 6 PM with food stalls and a chill-out zone. Headline set at 9 PM.',
    tickets: [['General', 'Standard entry', 499, 400], ['VIP', 'Front area + welcome drink', 1499, 60]], rating: [4.8, 214], tags: ['meghdoot', 'live music', 'vijay nagar'] },
  { title: 'Indore Tech Meetup: Backend & Cloud', category: 'technology', days: 5, hour: 18, venue: ['Crystal IT Park', 'Khandwa Road'], img: IMG.tech,
    short: 'Developers from across Indore share what they ship: APIs, cloud and AI.',
    desc: 'Three 20-minute talks, lightning demos and open networking. Built for developers, students and freshers looking for their first role. Snacks included.',
    tickets: [['RSVP', 'Free', 0, 120]], rating: [4.6, 98], tags: ['developers', 'crystal it park', 'meetup'] },
  { title: 'Indore Startup & Founders Summit', category: 'business', featured: true, days: 18, hour: 10, venue: ['Brilliant Convention Centre', 'Bypass Road'], img: IMG.conference,
    short: 'A day with founders, investors and operators from Indore and central India.',
    desc: 'Keynotes, panel discussions and an investor speed-meet. Lunch and a networking evening included. Meet people building companies from Indore.',
    tickets: [['Student', 'Valid student ID required', 299, 150], ['Professional', 'Full access + lunch', 999, 250]], rating: [4.5, 76], tags: ['startup', 'founders', 'bypass road'] },
  { title: 'Lalbagh Palace Heritage Evening', category: 'art', days: 12, hour: 18, venue: ['Lalbagh Palace', 'Lalbagh'], img: IMG.workshop,
    short: 'Classical music and a guided evening at the Holkar-era Lalbagh Palace.',
    desc: 'A guided walk through the palace grounds followed by a classical music recital on the lawns. Limited seats.',
    tickets: [['Evening pass', 'Guided walk + recital', 499, 100]], rating: [4.7, 54], tags: ['lalbagh', 'heritage', 'classical'] },
  { title: 'Pipliyapala Sunrise Run 10K', category: 'sports', days: 14, hour: 6, venue: ['Pipliyapala Regional Park', 'Pipliyapala'], img: IMG.sports,
    short: 'Run around the lake at sunrise: 5K fun run and a timed 10K.',
    desc: 'A scenic loop around Pipliyapala Regional Park with hydration points every 2 km, finisher medals and a post-run breakfast.',
    tickets: [['5 km', 'Fun run', 299, 300], ['10 km', 'Timed run', 499, 200]], rating: [4.7, 76], tags: ['running', 'pipliyapala', 'sunrise'] },
  { title: 'Palasia Open Mic Night', category: 'music', days: 3, hour: 20, venue: ['Palasia Square', 'Palasia'], img: IMG.networking,
    short: 'Sign up on the night, 7 minutes each. Singers, poets and stand-ups welcome.',
    desc: 'Friendly crowd, warm lights and a sign-up sheet at the door. Perform or just come to cheer.',
    tickets: [['Entry', 'Includes one drink', 199, 60]], rating: [4.6, 27], tags: ['open mic', 'palasia'] },
  { title: 'Clay & Pottery Weekend Workshop', category: 'workshop', days: 11, hour: 11, venue: ['Vijay Nagar Art Studio', 'Vijay Nagar'], img: IMG.workshop,
    short: 'Learn wheel throwing and take home two pieces you made yourself.',
    desc: 'A relaxed two-session beginner workshop. Materials, firing and glazing included. Limited to 20 seats so everyone gets time on the wheel.',
    tickets: [['Workshop', 'Both sessions', 1299, 20]], rating: [4.9, 41], tags: ['pottery', 'vijay nagar', 'workshop'] },
  { title: 'Holkar Stadium Cricket Fan Fest', category: 'sports', days: 16, hour: 16, venue: ['Holkar Stadium', 'Race Course Road'], img: IMG.sports,
    short: 'Big screen, fan zone and cricket games for kids on the stadium grounds.',
    desc: 'A fan festival for Indore\'s cricket lovers: big screens, food stalls, fan games and a kids\' coaching clinic.',
    tickets: [['Entry', 'Free entry', 0, 1500]], rating: [4.5, 63], tags: ['cricket', 'holkar stadium'] },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management');
    console.log('MongoDB connected');

    if (process.argv.includes('--reset')) {
      const old = await User.find({ email: { $in: USERS.map((u) => u.email) } });
      const ids = old.map((u) => u._id);
      await Event.deleteMany({ organizer: { $in: ids } });
      await Notification.deleteMany({ user: { $in: ids } });
      await User.deleteMany({ _id: { $in: ids } });
      console.log('Removed previous demo data');
    }

    const users = {};
    for (const u of USERS) {
      let doc = await User.findOne({ email: u.email });
      if (!doc) doc = await User.create(u);
      users[u.role] = doc;
    }

    const organizer = users.organizer;
    let created = 0;
    for (const e of EVENTS()) {
      const exists = await Event.findOne({ title: e.title, organizer: organizer._id });
      if (exists) continue;
      const { startDate, endDate } = inDays(e.days, e.hour);
      await Event.create({
        title: e.title,
        description: e.desc,
        shortDescription: e.short,
        organizer: organizer._id,
        organizerName: organizer.name,
        category: e.category,
        tags: ['indore', e.category, ...(e.tags || [])],
        startDate,
        endDate,
        venue: { name: e.venue[0], address: { street: e.venue[1], city: 'Indore', state: 'Madhya Pradesh', zipCode: '452001', country: 'India' } },
        images: [{ url: e.img, isMain: true }],
        ticketTypes: e.tickets.map(([name, description, price, quantity]) => ({
          name, description, price, quantity, sold: 0, salesEndDate: salesEnd(e.days),
        })),
        maxAttendees: e.tickets.reduce((sum, t) => sum + t[3], 0),
        status: 'published',
        featured: !!e.featured,
        rating: { average: e.rating[0], count: e.rating[1] },
      });
      created += 1;
    }

    if (!(await Notification.findOne({ user: users.user._id }))) {
      await Notification.create({
        user: users.user._id,
        type: 'system_announcement',
        title: 'Welcome to EventHub',
        message: 'Browse events and book your first ticket.',
      });
    }

    console.log(`Created ${created} events`);
    console.log('\nLogin with:');
    USERS.forEach((u) => console.log(`  ${u.role.padEnd(9)} ${u.email}  /  ${u.password}`));
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
