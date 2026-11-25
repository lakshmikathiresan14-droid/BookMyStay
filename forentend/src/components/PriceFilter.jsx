import { useState, useEffect } from "react";

// Sidebar price filter (minimum and maximum price).
export default function PriceFilter({ minPrice, maxPrice, onApply, onReset }) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const [error, setError] = useState("");

  useEffect(() => {
    setMin(minPrice);
    setMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (min !== "" && Number(min) < 0) return setError("Minimum can't be negative");
    if (min !== "" && max !== "" && Number(min) > Number(max))
      return setError("Minimum can't be more than maximum");
    setError("");
    onApply({ minPrice: min, maxPrice: max });
  };

  const handleReset = () => {
    setMin("");
    setMax("");
    setError("");
    onReset();
  };

  return (
    <form className="filter-box" onSubmit={handleSubmit}>
      <h2 className="filter-title">Price per night</h2>

      <div className="field">
        <label htmlFor="min-price">Min (₹)</label>
        <input
          id="min-price"
          type="number"
          min="0"
          placeholder="0"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="max-price">Max (₹)</label>
        <input
          id="max-price"
          type="number"
          min="0"
          placeholder="Any"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="filter-actions">
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
