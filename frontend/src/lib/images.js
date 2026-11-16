const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const IMG = {
  crowd: u("photo-1540575467063-178a50c2df87"),
  concert: u("photo-1470229722913-7c0e2dbbafd3"),
  party: u("photo-1492684223066-81342ee5ff30"),
  conference: u("photo-1511578314322-379afb476865"),
  festival: u("photo-1459749411175-04bf5292ceea"),
  workshop: u("photo-1517457373958-b7bdd4587205"),
  networking: u("photo-1522071820081-009f0129c71c"),
  food: u("photo-1414235077428-338989a2e8c0"),
  sports: u("photo-1461896836934-ffe607ba8211"),
  tech: u("photo-1505373877841-8d25f7d46678"),
};

export const CATEGORY_IMAGES = {
  music: IMG.concert,
  sports: IMG.sports,
  conference: IMG.conference,
  workshop: IMG.workshop,
  festival: IMG.festival,
  networking: IMG.networking,
  food: IMG.food,
  technology: IMG.tech,
  business: IMG.conference,
  art: IMG.workshop,
  education: IMG.workshop,
  charity: IMG.crowd,
  exhibition: IMG.crowd,
  health: IMG.sports,
  other: IMG.party,
};
