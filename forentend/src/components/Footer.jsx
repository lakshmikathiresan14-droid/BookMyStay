export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} BookMyStay. All rights reserved.</p>
        <p className="footer-note">Find a place. Add a place. Stay a while.</p>
      </div>
    </footer>
  );
}
