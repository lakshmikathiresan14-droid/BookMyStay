// Shows the hotel location on an OpenStreetMap embed using its latitude and longitude.
// (No API key needed.)
export default function MapView({ latitude, longitude, title }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const pad = 0.01; // how far the map is zoomed out around the marker

  const bbox = [lng - pad, lat - pad, lng + pad, lat + pad].join("%2C");
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const bigMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  return (
    <div className="map-wrap">
      <iframe
        title={`Map showing the location of ${title}`}
        src={embedUrl}
        loading="lazy"
        className="map-frame"
      />
      <p className="map-caption">
        Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)} ·{" "}
        <a href={bigMapUrl} target="_blank" rel="noreferrer">
          Open larger map
        </a>
      </p>
    </div>
  );
}
