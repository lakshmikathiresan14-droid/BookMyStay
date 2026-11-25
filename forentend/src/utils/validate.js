// Validation for the hotel form. Returns an object like { title: "message" }.
// An empty object means everything is fine.

export function validateHotel(values) {
  const errors = {};

  const title = values.title.trim();
  if (!title) errors.title = "Hotel name is required";
  else if (title.length < 3) errors.title = "Name must be at least 3 characters";
  else if (title.length > 80) errors.title = "Name must be 80 characters or less";

  const description = values.description.trim();
  if (!description) errors.description = "Description is required";
  else if (description.length < 20)
    errors.description = "Please write at least 20 characters";

  if (values.latitude === "" || values.latitude === null) {
    errors.latitude = "Latitude is required";
  } else {
    const lat = Number(values.latitude);
    if (Number.isNaN(lat)) errors.latitude = "Latitude must be a number";
    else if (lat < -90 || lat > 90) errors.latitude = "Latitude must be between -90 and 90";
  }

  if (values.longitude === "" || values.longitude === null) {
    errors.longitude = "Longitude is required";
  } else {
    const lng = Number(values.longitude);
    if (Number.isNaN(lng)) errors.longitude = "Longitude must be a number";
    else if (lng < -180 || lng > 180)
      errors.longitude = "Longitude must be between -180 and 180";
  }

  if (values.price === "" || values.price === null) {
    errors.price = "Price is required";
  } else {
    const price = Number(values.price);
    if (Number.isNaN(price)) errors.price = "Price must be a number";
    else if (price <= 0) errors.price = "Price must be greater than 0";
    else if (price > 1000000) errors.price = "Price looks too high";
  }

  if (!values.image) errors.image = "Please upload a hotel image";

  return errors;
}
