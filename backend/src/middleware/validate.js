// Checks the text fields of a hotel. Returns an object like { title: "message" };
// an empty object means the data is valid.
// `imageProvided` is true when a file was uploaded (or the hotel already has one).

const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

export function validateHotelBody(body, { imageProvided }) {
  const errors = {};

  const title = String(body.title ?? "").trim();
  if (!title) errors.title = "Hotel name is required";
  else if (title.length < 3) errors.title = "Name must be at least 3 characters";
  else if (title.length > 80) errors.title = "Name must be 80 characters or less";

  const description = String(body.description ?? "").trim();
  if (!description) errors.description = "Description is required";
  else if (description.length < 20) errors.description = "Please write at least 20 characters";

  if (isBlank(body.latitude)) errors.latitude = "Latitude is required";
  else {
    const lat = Number(body.latitude);
    if (Number.isNaN(lat)) errors.latitude = "Latitude must be a number";
    else if (lat < -90 || lat > 90) errors.latitude = "Latitude must be between -90 and 90";
  }

  if (isBlank(body.longitude)) errors.longitude = "Longitude is required";
  else {
    const lng = Number(body.longitude);
    if (Number.isNaN(lng)) errors.longitude = "Longitude must be a number";
    else if (lng < -180 || lng > 180) errors.longitude = "Longitude must be between -180 and 180";
  }

  if (isBlank(body.price)) errors.price = "Price is required";
  else {
    const price = Number(body.price);
    if (Number.isNaN(price)) errors.price = "Price must be a number";
    else if (price <= 0) errors.price = "Price must be greater than 0";
    else if (price > 1000000) errors.price = "Price looks too high";
  }

  if (!imageProvided) errors.image = "Please upload a hotel image";

  return errors;
}
