import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Scene3D from './Scene3D';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hero--visible');
        }
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" ref={heroRef} id="hero-section">
      {/* 3D Background */}
      <Scene3D />

      {/* Decorative grid overlay */}
      <div className="hero__grid-overlay" aria-hidden="true"></div>

      {/* Floating glow orbs */}
      <div className="hero__glow hero__glow--1" aria-hidden="true"></div>
      <div className="hero__glow hero__glow--2" aria-hidden="true"></div>

      {/* Content */}
      <div className="hero__content container">
        <div className="hero__badge">
          <span className="hero__badge-dot"></span>
          B2B Waste Management Platform
        </div>
        <h1 className="hero__title" id="hero-title">
          Turn food waste into<br />
          compliance <span className="hero__title-accent">automatically.</span>
        </h1>
        <p className="hero__subtitle" id="hero-subtitle">
          Connect your kitchen to licensed composting, biogas, and feed operators.<br />
          Get certificates, not landfill invoices.
        </p>
        <div className="hero__cta" id="hero-cta">
          <Link to="/register?role=generator" className="btn btn-primary btn-lg" id="cta-generator">
            Register as Generator
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to="/register?role=operator" className="btn btn-outline btn-lg" id="cta-operator">
            Register as Operator
          </Link>
        </div>


      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll" id="scroll-indicator">
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel"></div>
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;
