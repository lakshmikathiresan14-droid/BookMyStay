import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HotelForm from "../components/HotelForm";
import { createHotel, setPage } from "../redux/hotelSlice";

export default function AddHotel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // If the API call fails, unwrap() throws and the form shows the error.
  const handleSubmit = async (values, file) => {
    const hotel = await dispatch(createHotel({ values, file })).unwrap();
    dispatch(setPage(1)); // new hotels show up first
    navigate("/", { state: { message: `"${hotel.title}" was added successfully.` } });
  };

  return (
    <div className="container page-narrow">
      <Helmet>
        <title>Add a Hotel - BookMyStay</title>
        <meta name="description" content="Add a new hotel listing to BookMyStay." />
      </Helmet>

      <h1 className="page-title">Add a hotel</h1>
      <p className="page-sub">Fill in the details below. Fields marked * are required.</p>

      <div className="panel">
        <HotelForm onSubmit={handleSubmit} submitLabel="Add hotel" onCancel={() => navigate("/")} />
      </div>
    </div>
  );
}
