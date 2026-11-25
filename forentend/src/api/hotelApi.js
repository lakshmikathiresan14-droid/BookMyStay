// All calls to the backend live here, so components never deal with fetch directly.

const API_BASE = import.meta.env.VITE_API_URL || "";

// Wrapper around fetch that turns failures into { message, errors } objects.
async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw { message: "Can't reach the server. Is the backend running?" };
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      message: data?.message || `Request failed (${response.status})`,
      errors: data?.errors, // field errors from the server validation
    };
  }
  return data;
}

// Hotels are sent as multipart/form-data because of the image file.
function toFormData(values, file) {
  const form = new FormData();
  form.append("title", values.title);
  form.append("description", values.description);
  form.append("latitude", values.latitude);
  form.append("longitude", values.longitude);
  form.append("price", values.price);
  if (file) form.append("image", file);
  return form;
}

// GET /api/hotels?search=&minPrice=&maxPrice=&limit=&offset=
export function getHotels({ search, minPrice, maxPrice, limit, offset }) {
  const params = new URLSearchParams();
  if (search && search.trim()) params.set("search", search.trim());
  if (minPrice !== "" && minPrice !== undefined) params.set("minPrice", minPrice);
  if (maxPrice !== "" && maxPrice !== undefined) params.set("maxPrice", maxPrice);
  params.set("limit", limit);
  params.set("offset", offset);
  return request(`/api/hotels?${params.toString()}`);
}

export const getHotel = (id) => request(`/api/hotels/${id}`);

export const createHotel = (values, file) =>
  request("/api/hotels", { method: "POST", body: toFormData(values, file) });

export const updateHotel = (id, values, file) =>
  request(`/api/hotels/${id}`, { method: "PUT", body: toFormData(values, file) });

export const deleteHotel = (id) => request(`/api/hotels/${id}`, { method: "DELETE" });
