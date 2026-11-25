import { Link } from "react-router-dom";
import { formatPrice, truncate, imageUrl, handleImageError } from "../utils/helpers";

export default function HotelCard({ hotel, onDelete }) {
  const detailsUrl = `/hotels/${hotel.id}`;

  return (
    <article className="card">
      <Link to={detailsUrl} className="card-image-link">
        <img
          className="card-image"
          src={imageUrl(hotel.image)}
          alt={`${hotel.title} - hotel photo`}
          loading="lazy"
          onError={handleImageError}
        />
      </Link>

      <div className="card-body">
        <div className="card-top">
          <h3 className="card-title">
            <Link to={detailsUrl}>{hotel.title}</Link>
          </h3>
          <p className="card-price">
            {formatPrice(hotel.price)}
            <span> / night</span>
          </p>
        </div>

        <p className="card-desc">{truncate(hotel.description)}</p>

        <div className="card-actions">
          <Link to={detailsUrl} className="btn btn-small btn-primary">
            View
          </Link>
          <Link to={`${detailsUrl}/edit`} className="btn btn-small btn-outline">
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-small btn-danger-outline"
            onClick={() => onDelete(hotel)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
