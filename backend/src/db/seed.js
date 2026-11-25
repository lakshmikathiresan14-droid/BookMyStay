import { pool } from "./pool.js";

// Starter hotels. Images are seeded picsum.photos URLs, so nothing needs to be in /uploads.
const img = (seed) => `https://picsum.photos/seed/${seed}/800/500`;

const hotels = [
  ["Hilltop Retreat Ooty", "A calm stay surrounded by tea gardens and pine trees. Rooms have large windows facing the Nilgiri hills, and breakfast is served on the open terrace with fresh filter coffee.", 11.4102, 76.695, 4200, img("ooty-retreat")],
  ["Backwater Bliss Alleppey", "Wake up to the sound of the backwaters. Traditional Kerala architecture, a private jetty, and a restaurant that serves a proper fish curry and appam breakfast.", 9.4981, 76.3388, 6500, img("alleppey-bliss")],
  ["Coimbatore City Inn", "A budget friendly business hotel five minutes from the railway station. Clean rooms, fast wifi, a small gym and an all-day South Indian restaurant.", 11.0168, 76.9558, 1800, img("coimbatore-inn")],
  ["Sunset Shores Goa", "Beachfront rooms with sea views, a pool bar and live music in the evenings. A short walk from the water and close to the best seafood shacks in North Goa.", 15.5527, 73.7517, 7800, img("goa-shores")],
  ["Royal Haveli Jaipur", "A restored haveli with painted courtyards, camel-leather lamps and rooftop dining with a view of Nahargarh Fort. Cultural performances every evening.", 26.9124, 75.7873, 9200, img("jaipur-haveli")],
  ["Lakeview Palace Udaipur", "Rooms and suites overlooking Lake Pichola. Boat transfers to the City Palace, a spa, and a rooftop restaurant that is best at sunset.", 24.5764, 73.6798, 11500, img("udaipur-lakeview")],
  ["Tea Estate Cottages Munnar", "Wooden cottages inside a working tea estate. Guided plantation walks in the morning, bonfire evenings, and plenty of mist.", 10.0889, 77.0595, 5400, img("munnar-cottages")],
  ["Heritage Quarter Pondicherry", "A French colonial villa turned boutique hotel in the White Town. Yellow walls, bougainvillea, a quiet courtyard cafe and bicycles you can borrow for free.", 11.9344, 79.8306, 5900, img("pondy-heritage")],
  ["Marine Drive Suites Mumbai", "Modern suites a few steps from the Marine Drive promenade. Good for business trips: meeting rooms, airport pickup and a late checkout option.", 18.943, 72.8238, 12800, img("mumbai-suites")],
  ["Palace Road Mysuru Lodge", "Simple, well kept rooms near the Mysore Palace. Family run, with home-style food and a garden where kids can play.", 12.3052, 76.6552, 2400, img("mysuru-lodge")],
  ["Cloud Nine Darjeeling", "On a clear morning you can see Kanchenjunga from your bed. Wood-heated rooms, a library lounge and a tea tasting every afternoon.", 27.036, 88.2627, 4800, img("darjeeling-cloud")],
  ["Fort Cochin Harbour Stay", "Steps from the Chinese fishing nets and the old spice market. Sea-breeze balconies, an in-house cafe and heritage walk tours booked at the desk.", 9.9658, 76.2421, 3600, img("cochin-harbour")],
];

try {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM hotels");
  if (rows[0].count > 0) {
    console.log(`Table already has ${rows[0].count} hotels, skipping the seed.`);
  } else {
    for (const [title, description, latitude, longitude, price, image] of hotels) {
      await pool.query(
        `INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [title, description, latitude, longitude, price, image]
      );
    }
    console.log(`Added ${hotels.length} sample hotels.`);
  }
} catch (err) {
  console.error("Seeding failed:", err.message);
  console.error("Did you run `npm run db:init` first?");
  process.exitCode = 1;
} finally {
  await pool.end();
}
