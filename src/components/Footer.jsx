import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="/" className="footer__logo">
              <img src="/logo.png" alt="WasteBridge Logo" style={{height: '32px', width: 'auto', objectFit: 'contain'}} />
              <span>WasteBridge</span>
            </a>
            <p className="footer__tagline">
              Bridging waste producers to sustainable solutions.<br />
              Making compliance effortless.
            </p>
            <div className="footer__social">
              {['X', 'In', 'Fb', 'Ig'].map((icon, i) => (
                <a key={i} href="#" className="footer__social-link" aria-label={icon}>{icon}</a>
              ))}
            </div>
          </div>

          <div className="footer__links-group">
            <div className="footer__col">
              <h4>Platform</h4>
              <ul>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">API Docs</a></li>
                <li><a href="#">Integrations</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Solutions</h4>
              <ul>
                <li><a href="#">For Schools</a></li>
                <li><a href="#">For Restaurants</a></li>
                <li><a href="#">For Hotels</a></li>
                <li><a href="#">For Operators</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} WasteBridge Technologies Pvt. Ltd. All rights reserved.</p>
          <p>Made with 💚 for a sustainable future</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
