import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './WhoItsFor.css';

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#d1fae5"/>
    <path d="M5.5 9L8 11.5L12.5 7" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const WhoItsFor = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('wif--visible');
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="wif" ref={sectionRef} id="who-its-for">
      <div className="container">
        <div className="wif__header">
          <span className="section-label">Who It's For</span>
          <h2 className="section-title">Built for both sides of the waste cycle</h2>
          <p className="section-subtitle">Whether you generate waste or process it — WasteBridge has you covered.</p>
        </div>

        <div className="wif__grid">
          <div className="wif__card" id="card-generators">
            <div className="wif__card-badge wif__card-badge--green">Waste Producers</div>
            <h3 className="wif__card-title">For Generators</h3>
            <p className="wif__card-subtitle">Schools, Restaurants, Hotels, Canteens & Institutions</p>
            <div className="wif__card-section">
              <h4>Common Pain Points</h4>
              <ul className="wif__pain-list">
                <li><span>😤</span> No visibility into where waste ends up</li>
                <li><span>📋</span> Manual compliance tracking is tedious</li>
                <li><span>🚛</span> Unreliable pickup schedules</li>
                <li><span>💰</span> Overpaying for inefficient disposal</li>
              </ul>
            </div>
            <div className="wif__card-section">
              <h4>With WasteBridge</h4>
              <ul className="wif__check-list">
                <li><CheckIcon /> Auto-matched to nearest licensed operators</li>
                <li><CheckIcon /> Disposal certificates generated automatically</li>
                <li><CheckIcon /> Track environmental impact in real-time</li>
              </ul>
            </div>
            <Link to="/register?role=generator" className="btn btn-primary" id="card-cta-gen">Start as Generator <ArrowIcon /></Link>
          </div>

          <div className="wif__card" id="card-operators">
            <div className="wif__card-badge wif__card-badge--teal">Waste Processors</div>
            <h3 className="wif__card-title">For Disposal Operators</h3>
            <p className="wif__card-subtitle">Composters, Biogas Plants, Animal Feed & Recycling</p>
            <div className="wif__card-section">
              <h4>Key Benefits</h4>
              <ul className="wif__check-list">
                <li><CheckIcon /> Steady pipeline of verified waste generators</li>
                <li><CheckIcon /> Optimized route planning for collections</li>
                <li><CheckIcon /> Digital certificate issuance system</li>
                <li><CheckIcon /> Increased capacity utilization</li>
                <li><CheckIcon /> Dashboard analytics and compliance reports</li>
              </ul>
            </div>
            <Link to="/register?role=operator" className="btn btn-outline-dark" id="card-cta-op">Join as Operator <ArrowIcon /></Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoItsFor;
