import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SearchBar from "../components/SearchBar";
import PriceFilter from "../components/PriceFilter";
import HotelCard from "../components/HotelCard";
import Pagination from "../components/Pagination";
import DeleteFlow from "../components/DeleteFlow";
import {
  PAGE_SIZE,
  fetchHotels,
  selectHotels,
  selectTotal,
  selectListStatus,
  selectListError,
  selectFilters,
  selectPage,
  setSearch,
  setPriceRange,
  resetFilters,
  setPage,
} from "../redux/hotelSlice";

export default function HotelList() {
  const dispatch = useDispatch();
  const location = useLocation();

  const hotels = useSelector(selectHotels);
  const total = useSelector(selectTotal);
  const status = useSelector(selectListStatus);
  const error = useSelector(selectListError);
  const filters = useSelector(selectFilters);
  const page = useSelector(selectPage);

  const [hotelToDelete, setHotelToDelete] = useState(null);
  // message coming from the Add page, e.g. "Hotel added"
  const [notice, setNotice] = useState(location.state?.message || "");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;

  const loadHotels = () => dispatch(fetchHotels({ ...filters, page }));

  // Ask the API for the current page whenever the search, price filter or page changes.
  useEffect(() => {
    dispatch(fetchHotels({ ...filters, page }));
  }, [dispatch, filters, page]);

  // If the page we're on no longer exists (e.g. we deleted the last hotel on it),
  // step back to the last page that does.
  useEffect(() => {
    if (status === "succeeded" && page > totalPages) dispatch(setPage(totalPages));
  }, [status, page, totalPages, dispatch]);

  const hasFilters = filters.search || filters.minPrice !== "" || filters.maxPrice !== "";

  const changePage = (p) => {
    dispatch(setPage(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteFinished = () => {
    setHotelToDelete(null);
    loadHotels(); // refill the page now that one hotel is gone
  };

  const firstLoad = status === "loading" && hotels.length === 0;

  return (
    <>
      <Helmet>
        <title>Hotels - BookMyStay</title>
        <meta
          name="description"
          content="Browse hotels, filter by price and find your next stay with BookMyStay."
        />
        <link rel="canonical" href={window.location.origin + "/"} />
      </Helmet>

      <section className="hero">
        <div className="container">
          <h1>Find your next stay</h1>
          <SearchBar value={filters.search} onSearch={(text) => dispatch(setSearch(text))} />
        </div>
      </section>

      <div className="container layout">
        <aside className="sidebar">
          <PriceFilter
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onApply={(range) => dispatch(setPriceRange(range))}
            onReset={() => dispatch(setPriceRange({ minPrice: "", maxPrice: "" }))}
          />
        </aside>

        <section className="results" aria-live="polite">
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
                ×
              </button>
            </div>
          )}

          {status === "failed" && (
            <div className="form-error" role="alert">
              <span>{error}</span>{" "}
              <button type="button" className="link-btn" onClick={loadHotels}>
                Try again
              </button>
            </div>
          )}

          <div className="results-head">
            <p>
              {firstLoad
                ? "Loading hotels…"
                : total === 0
                ? "No hotels found"
                : `Showing ${start + 1}–${start + hotels.length} of ${total} hotels`}
            </p>
            {hasFilters && (
              <button type="button" className="link-btn" onClick={() => dispatch(resetFilters())}>
                Clear all filters
              </button>
            )}
          </div>

          {hotels.length > 0 ? (
            <div className={`card-grid ${status === "loading" ? "is-loading" : ""}`}>
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onDelete={setHotelToDelete} />
              ))}
            </div>
          ) : (
            status === "succeeded" && (
              <div className="empty">
                <p className="empty-emoji" aria-hidden="true">🔍</p>
                <h2>Nothing matches that search</h2>
                <p>Try a different name or widen the price range.</p>
              </div>
            )
          )}

          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </section>
      </div>

      <DeleteFlow
        hotel={hotelToDelete}
        onCancel={() => setHotelToDelete(null)}
        onFinished={handleDeleteFinished}
      />
    </>
  );
}
