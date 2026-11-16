// Allows FRONTEND_URL (comma separated list is fine) and, outside production,
// any localhost / 127.0.0.1 port, so the React dev server works even if it
// starts on 3001 because 3000 was busy.
const allowed = () =>
  (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const isLocal = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const origin = (reqOrigin, cb) => {
  if (!reqOrigin) return cb(null, true); // curl / server-to-server
  if (allowed().includes(reqOrigin)) return cb(null, true);
  if (process.env.NODE_ENV !== 'production' && isLocal(reqOrigin)) return cb(null, true);
  return cb(null, false);
};

module.exports = { origin, credentials: true };
