import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MapView from "../components/MapView";
import DeleteFlow from "../components/DeleteFlow";
import {
  fetchHotelById,
  selectCurrent,
  selectCurrentError,
  selectCurrentStatus,
} from "../redux/hotelSlice";
import { formatPrice, truncate, imageUrl, handleImageError } from "../utils/helpers";

export default function HotelDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const current = useSelector(selectCurrent);
  const status = useSelector(selectCurrentStatus);
  const error = useSelector(selectCurrentError);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchHotelById(id));
  }, [dispatch, id]);

  const hotel = current && String(current.id) === id ? current : null;

  let content;

  if (hotel) {
    const metaDescription = truncate(hotel.description, 155);
    const photo = imageUrl(hotel.image);

    content = (
      <div className="container details">
        <Helmet>
          <title>{`${hotel.title} - BookMyStay`}</title>
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={`${hotel.title} - BookMyStay`} />
          <meta property="og:description" content={metaDescription} />
          <meta
            property="og:image"
            content={photo.startsWith("http") ? photo : window.location.origin + photo}
          />
          <meta property="og:type" content="website" />
        </Helmet>

        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Hotels</Link> <span>›</span> {hotel.title}
        </nav>

        <div className="details-grid">
          <img
            className="details-image"
            src={photo}
            alt={`${hotel.title} - main photo`}
            onError={handleImageError}
          />

          <div className="details-info">
            <h1>{hotel.title}</h1>
            <p className="details-price">
              {formatPrice(hotel.price)} <span>per night</span>
            </p>

            <h2 className="details-heading">About this hotel</h2>
            <p className="details-desc">{hotel.description}</p>

            <dl className="facts">
              <div>
                <dt>Latitude</dt>
                <dd>{hotel.latitude}</dd>
              </div>
              <div>
                <dt>Longitude</dt>
                <dd>{hotel.longitude}</dd>
              </div>
            </dl>

            <div className="details-actions">
              <Link to={`/hotels/${hotel.id}/edit`} className="btn btn-outline">
                Edit
              </Link>
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={() => setDeleting(true)}
              >
                Delete
              </button>
              <Link to="/" className="btn btn-ghost">
                ← Back to list
              </Link>
            </div>
          </div>
        </div>

        <section className="details-map">
          <h2 className="details-heading">Location</h2>
          <MapView latitude={hotel.latitude} longitude={hotel.longitude} title={hotel.title} />
        </section>
      </div>
    );
  } else if (status === "loading" || status === "idle") {
    content = (
      <div className="container page-narrow empty">
        <p>Loading hotel…</p>
      </div>
    );
  } else if (!deleting) {
    content = (
      <div className="container page-narrow empty">
        <Helmet>
          <title>Hotel not found - BookMyStay</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1>Hotel not found</h1>
        <p>{error || "We couldn't find that hotel. It may have been removed."}</p>
        <Link to="/" className="btn btn-primary">
          Back to hotels
        </Link>
      </div>
    );
  }
  // else: the hotel was just deleted, so show nothing behind the success popup.

  // DeleteFlow stays mounted in the same spot the whole time, so its
  // "deleted" state survives the hotel disappearing from the store.
  return (
    <>
      {content}
      <DeleteFlow
        hotel={deleting ? hotel : null}
        onCancel={() => setDeleting(false)}
        onFinished={() => navigate("/")}
      />
    </>
  );
}
