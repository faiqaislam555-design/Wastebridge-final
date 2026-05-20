import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Generators', href: '#who-its-for' },
    { label: 'For Operators', href: '#who-its-for' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo" id="logo-link">
          <img src="/logo.png" alt="WasteBridge Logo" className="navbar__logo-icon" style={{height: '32px', width: 'auto', objectFit: 'contain'}} />
          <span className="navbar__wordmark">WasteBridge</span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`} id="nav-links">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="navbar__link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="navbar__links-cta-mobile">
            <Link to="/login" className="btn btn-ghost btn-sm" id="mobile-login-btn">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" id="mobile-cta-btn">Get Started</Link>
          </div>
        </div>

        <div className="navbar__actions" id="nav-actions">
          <Link to="/login" className="btn btn-ghost btn-sm" id="login-btn">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm" id="get-started-btn">Get Started</Link>
        </div>

        <button
          className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          id="hamburger-btn"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
