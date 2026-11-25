import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HotelForm from "../components/HotelForm";
import {
  editHotel,
  fetchHotelById,
  selectCurrent,
  selectCurrentError,
  selectCurrentStatus,
} from "../redux/hotelSlice";

export default function EditHotel() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const current = useSelector(selectCurrent);
  const status = useSelector(selectCurrentStatus);
  const error = useSelector(selectCurrentError);

  // Always load fresh data from the API when this page opens.
  useEffect(() => {
    dispatch(fetchHotelById(id));
  }, [dispatch, id]);

  const hotel = current && String(current.id) === id ? current : null;

  if (status === "failed") {
    return (
      <div className="container page-narrow empty">
        <h1>Hotel not found</h1>
        <p>{error || "It may have been deleted."}</p>
        <Link to="/" className="btn btn-primary">
          Back to hotels
        </Link>
      </div>
    );
  }

  // The form copies its starting values once, so wait for the fresh data.
  if (!hotel || status !== "succeeded") {
    return (
      <div className="container page-narrow empty">
        <p>Loading hotel…</p>
      </div>
    );
  }

  const handleSubmit = async (values, file) => {
    await dispatch(editHotel({ id: hotel.id, values, file })).unwrap();
    navigate(`/hotels/${hotel.id}`);
  };

  return (
    <div className="container page-narrow">
      <Helmet>
        <title>{`Edit ${hotel.title} - BookMyStay`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="page-title">Edit hotel</h1>
      <p className="page-sub">Update the details for {hotel.title}.</p>

      <div className="panel">
        <HotelForm
          initialValues={hotel}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
