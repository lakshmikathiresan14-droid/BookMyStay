import { useState, useEffect } from "react";

// Search box for hotel titles. Waits a moment after typing stops before filtering,
// so we don't re-filter on every single keystroke.
export default function SearchBar({ value, onSearch }) {
  const [text, setText] = useState(value);

  // keep the box in sync if filters get reset from outside
  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onSearch(text), 300);
    return () => clearTimeout(timer);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      className="searchbar"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text);
      }}
    >
      <label htmlFor="hotel-search" className="sr-only">
        Search hotels by title
      </label>
      <input
        id="hotel-search"
        type="search"
        placeholder="Search hotels by name…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="btn btn-accent">
        Search
      </button>
    </form>
  );
}
