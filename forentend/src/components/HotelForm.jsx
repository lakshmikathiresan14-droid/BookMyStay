import { useState, useRef, useEffect } from "react";
import { validateHotel } from "../utils/validate";
import { imageUrl, handleImageError } from "../utils/helpers";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB, same limit as the server

const emptyHotel = {
  title: "",
  description: "",
  latitude: "",
  longitude: "",
  price: "",
  image: "", // preview source: the saved image path, or a blob: URL for a new file
};

// One form used for both Add and Edit.
// - Add: don't pass initialValues
// - Edit: pass the existing hotel as initialValues
// onSubmit(values, imageFile) can return a promise. If it rejects with
// { message, errors } the messages are shown on the form.
export default function HotelForm({ initialValues, onSubmit, submitLabel = "Save hotel", onCancel }) {
  const [values, setValues] = useState({ ...emptyHotel, ...initialValues });
  const [imageFile, setImageFile] = useState(null); // only set when the user picks a new file
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const fileInput = useRef(null);
  const blobUrl = useRef(null);

  // free the preview URL when the form goes away
  useEffect(() => {
    return () => {
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    };
  }, []);

  const clearBlob = () => {
    if (blobUrl.current) {
      URL.revokeObjectURL(blobUrl.current);
      blobUrl.current = null;
    }
  };

  // Update a field and re-check it if the user has already visited it.
  const setField = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateHotel(next)[name] }));
    }
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateHotel(values)[name] }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please choose an image file (JPG, PNG, WebP)" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, image: "Image must be smaller than 5 MB" }));
      return;
    }

    clearBlob();
    blobUrl.current = URL.createObjectURL(file);
    setImageFile(file);
    setValues((prev) => ({ ...prev, image: blobUrl.current }));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const removeImage = () => {
    clearBlob();
    setImageFile(null);
    setValues((prev) => ({ ...prev, image: "" }));
    if (fileInput.current) fileInput.current.value = "";
  };

  // Uses the browser Geolocation API to fill latitude and longitude.
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Your browser doesn't support geolocation.");
      return;
    }
    setLocating(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValues((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
        setLocating(false);
      },
      () => {
        setLocationMessage("Couldn't get your location. Please type it in instead.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateHotel(values);
    setErrors(found);
    setTouched({ title: true, description: true, latitude: true, longitude: true, price: true, image: true });
    setServerError("");

    if (Object.keys(found).length > 0) {
      // jump to the first field with a problem
      const firstKey = Object.keys(found)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        {
          title: values.title.trim(),
          description: values.description.trim(),
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
          price: Number(values.price),
        },
        imageFile
      );
    } catch (err) {
      // validation errors coming back from the server
      if (err?.errors) setErrors(err.errors);
      setServerError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name) =>
    errors[name] ? (
      <p className="error-text" id={`error-${name}`} role="alert">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form className="hotel-form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="form-error" role="alert">
          {serverError}
        </div>
      )}

      {/* Image upload + preview */}
      <div className="field">
        <label htmlFor="field-image">Hotel image *</label>
        <div className={`upload-box ${errors.image ? "has-error" : ""}`}>
          {values.image ? (
            <div className="preview">
              <img src={imageUrl(values.image)} alt="Preview of the hotel" onError={handleImageError} />
              <button type="button" className="btn btn-small btn-danger-outline" onClick={removeImage}>
                Remove image
              </button>
            </div>
          ) : (
            <p className="upload-hint">No image selected. JPG, PNG, WebP or GIF, up to 5 MB.</p>
          )}
          <input
            id="field-image"
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImage}
            aria-describedby="error-image"
          />
        </div>
        {fieldError("image")}
      </div>

      <div className="field">
        <label htmlFor="field-title">Hotel name *</label>
        <input
          id="field-title"
          name="title"
          type="text"
          placeholder="e.g. Hilltop Retreat Ooty"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.title ? "invalid" : ""}
          aria-describedby="error-title"
        />
        {fieldError("title")}
      </div>

      <div className="field">
        <label htmlFor="field-description">Description *</label>
        <textarea
          id="field-description"
          name="description"
          rows="5"
          placeholder="Tell guests what makes this place special…"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.description ? "invalid" : ""}
          aria-describedby="error-description"
        />
        {fieldError("description")}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="field-latitude">Latitude *</label>
          <input
            id="field-latitude"
            name="latitude"
            type="number"
            step="any"
            placeholder="e.g. 11.0168"
            value={values.latitude}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.latitude ? "invalid" : ""}
            aria-describedby="error-latitude"
          />
          {fieldError("latitude")}
        </div>

        <div className="field">
          <label htmlFor="field-longitude">Longitude *</label>
          <input
            id="field-longitude"
            name="longitude"
            type="number"
            step="any"
            placeholder="e.g. 76.9558"
            value={values.longitude}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.longitude ? "invalid" : ""}
            aria-describedby="error-longitude"
          />
          {fieldError("longitude")}
        </div>
      </div>

      <div className="location-helper">
        <button type="button" className="btn btn-small btn-outline" onClick={useMyLocation} disabled={locating}>
          {locating ? "Finding you…" : "📍 Use my current location"}
        </button>
        {locationMessage && <span className="error-text">{locationMessage}</span>}
      </div>

      <div className="field">
        <label htmlFor="field-price">Price per night (₹) *</label>
        <input
          id="field-price"
          name="price"
          type="number"
          min="0"
          step="any"
          placeholder="e.g. 4500"
          value={values.price}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.price ? "invalid" : ""}
          aria-describedby="error-price"
        />
        {fieldError("price")}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
