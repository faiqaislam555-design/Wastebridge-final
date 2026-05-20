import { useEffect, useRef } from 'react';
import './HowItWorks.css';

const steps = [
  {
    step: '01',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="url(#step1-bg)" />
        <path d="M14 26V20L16 14H24L26 20V26H14Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 20H26" stroke="white" strokeWidth="1.8" />
        <path d="M18 14V12H22V14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="17" cy="23" r="1.2" fill="white" />
        <circle cx="23" cy="23" r="1.2" fill="white" />
        <defs>
          <linearGradient id="step1-bg" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Log Your Waste',
    description: 'Register your institution and log daily waste output — food scraps, kitchen waste, or organic residue. Our system categorizes it automatically.',
  },
  {
    step: '02',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="url(#step2-bg)" />
        <circle cx="15" cy="18" r="4" stroke="white" strokeWidth="1.8" />
        <circle cx="25" cy="18" r="4" stroke="white" strokeWidth="1.8" />
        <path d="M18 20C19 22 21 22 22 20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13 28H27" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 25L20 28L24 25" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="step2-bg" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Get Matched',
    description: 'We connect you with licensed composting, biogas, or animal feed operators near you. Choose the best fit and schedule pickups instantly.',
  },
  {
    step: '03',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="url(#step3-bg)" />
        <rect x="12" y="12" width="16" height="18" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M16 18L19 21L25 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 25H24" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M16 27.5H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <defs>
          <linearGradient id="step3-bg" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#047857" />
            <stop offset="1" stopColor="#065f46" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: 'Receive Certificate',
    description: 'After every pickup, receive a verified disposal certificate. Stay compliant with CPCB, state boards, and ESG reporting standards.',
  },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hiw--visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hiw" ref={sectionRef} id="how-it-works">
      <div className="container">
        <div className="hiw__header">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Three steps to sustainable compliance</h2>
          <p className="section-subtitle">
            From waste generation to certified disposal — all in one seamless workflow.
          </p>
        </div>

        <div className="hiw__steps">
          {steps.map((step, index) => (
            <div
              className="hiw__step"
              key={index}
              id={`step-${index + 1}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="hiw__step-number">{step.step}</div>
              <div className="hiw__step-icon">{step.icon}</div>
              <h3 className="hiw__step-title">{step.title}</h3>
              <p className="hiw__step-desc">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hiw__connector" aria-hidden="true">
                  <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                    <path d="M0 10H50M50 10L42 4M50 10L42 16" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
