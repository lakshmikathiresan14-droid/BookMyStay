const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => priceFormatter.format(Number(value) || 0);

// Cut long descriptions down for the cards.
export function truncate(text, max = 110) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

// Turns the image value from the API into something an <img> can load.
// - "/uploads/abc.jpg"  -> served by our backend
// - "https://..."       -> used as is (the seed data)
// - "blob:" / "data:"   -> local preview of a file the user just picked
export function imageUrl(path) {
  if (!path) return "";
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return (import.meta.env.VITE_API_URL || "") + path;
}

// Shown if an image URL is broken.
export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#dbe7f5"/><text x="50%" y="50%" fill="#5b7aa0" font-family="Arial" font-size="32" text-anchor="middle">No image available</text></svg>`
  );

export function handleImageError(e) {
  // Avoid an infinite loop if the fallback itself fails.
  if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE;
}
