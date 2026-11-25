import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="BookMyStay home">
          <span className="logo-icon" aria-hidden="true">🏨</span>
          BookMyStay
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/" end className="nav-link">
            Hotels
          </NavLink>
          <NavLink to="/hotels/new" className="nav-link nav-cta">
            + Add Hotel
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
