import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <div className="container page-narrow empty">
      <Helmet>
        <title>Page not found - BookMyStay</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1>404 - Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Go to hotels
      </Link>
    </div>
  );
}
