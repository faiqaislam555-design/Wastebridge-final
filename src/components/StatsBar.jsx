import { useEffect, useRef, useState } from 'react';
import './StatsBar.css';

const stats = [
  { value: 12400, suffix: '', label: 'Tonnes Diverted', prefix: '', icon: '♻️' },
  { value: 340, suffix: '+', label: 'Licensed Operators', prefix: '', icon: '🏭' },
  { value: 98, suffix: '%', label: 'Compliance Rate', prefix: '', icon: '✅' },
  { value: 60, suffix: '+', label: 'Cities Covered', prefix: '', icon: '🌍' },
];

function AnimatedNumber({ target, suffix, prefix, duration = 2000 }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref} className="stats__number">
      {prefix}{current.toLocaleString()}{suffix}
    </span>
  );
}

const StatsBar = () => {
  return (
    <section className="stats" id="stats-bar">
      <div className="container">
        <div className="stats__grid">
          {stats.map((stat, index) => (
            <div className="stats__item" key={index} id={`stat-${index}`}>
              <span className="stats__icon">{stat.icon}</span>
              <AnimatedNumber
                target={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
              <span className="stats__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
