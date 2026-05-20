import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Impact.css';

function AnimatedNum({ target, suffix = '', duration = 2500 }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const Impact = () => {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) e.target.classList.add('impact--visible'); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="impact" ref={ref} id="impact-section">
      <div className="impact__bg-pattern" aria-hidden="true"></div>
      <div className="container">
        <div className="impact__content">
          <span className="impact__label">Our Collective Impact</span>
          <h2 className="impact__title">Together, we're making a difference</h2>

          <div className="impact__metrics">
            <div className="impact__metric" id="metric-co2">
              <div className="impact__metric-value">
                <AnimatedNum target={8500} suffix=" T" />
              </div>
              <div className="impact__metric-label">CO₂ Emissions Offset</div>
            </div>

            <div className="impact__divider"></div>

            <div className="impact__metric" id="metric-diverted">
              <div className="impact__metric-value">
                <AnimatedNum target={12400} suffix=" T" />
              </div>
              <div className="impact__metric-label">Waste Diverted from Landfills</div>
            </div>

            <div className="impact__divider"></div>

            <div className="impact__metric" id="metric-institutions">
              <div className="impact__metric-value">
                <AnimatedNum target={500} suffix="+" />
              </div>
              <div className="impact__metric-label">Institutions Already Compliant</div>
            </div>
          </div>

          <Link to="/register" className="btn btn-primary btn-lg impact__cta" id="impact-cta">
            Join the Movement
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Impact;
