import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  Play,
  Cpu,
  Wifi,
  Bot,
  Code2,
  BrainCircuit,
  Infinity,
  BookOpen,
  Settings,
  Users,
  Star,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import courseHeroImage from "../../../assets/Courses/CourseHero/course-hero.png";
import "./CourseHero.css";

const floatingTopics = [
  { label: "IoT", icon: Cpu, className: "topic-iot" },
  { label: "Sensors", icon: Wifi, className: "topic-sensors" },
  { label: "Arduino", icon: Infinity, className: "topic-arduino" },
  { label: "Robotics", icon: Bot, className: "topic-robotics" },
  { label: "Coding", icon: Code2, className: "topic-coding" },
  { label: "AI", icon: BrainCircuit, className: "topic-ai" },
];

const stats = [
  {
    value: 6,
    suffix: "+",
    label: "Learning Areas",
    icon: BookOpen,
    tone: "purple",
  },
  {
    value: 20,
    suffix: "+",
    label: "Practical Projects",
    icon: Settings,
    tone: "blue",
  },
  {
    value: 100,
    suffix: "+",
    label: "Students Trained",
    icon: Users,
    tone: "green",
  },
  {
    value: null,
    suffix: "",
    label: "Mentor Support",
    display: "Expert",
    icon: Star,
    tone: "yellow",
  },
];

function useCountUp(target, active, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || target === null) {
      setCount(0);
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return undefined;
    }

    let frameId;
    let startTime;

    const animate = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [target, active, duration]);

  return count;
}

function StatCard({ stat, active }) {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, active);

  return (
    <article className={`course-stat-card course-stat-${stat.tone}`}>
      <span className="course-stat-icon">
        <Icon size={26} strokeWidth={2.3} aria-hidden="true" />
      </span>

      <div className="course-stat-copy">
        <strong>{stat.display ?? `${count}${stat.suffix}`}</strong>
        <span>{stat.label}</span>
      </div>
    </article>
  );
}

export default function CourseHero() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const revealSection = () => setIsVisible(true);

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      revealSection();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -15px 0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Scroll to Popular Learning if this hero is rendered on the Courses page.
  useEffect(() => {
    if (
      location.pathname !== "/courses" ||
      location.hash !== "#popular-learning"
    ) {
      return undefined;
    }

    const frameId = requestAnimationFrame(() => {
      document.getElementById("popular-learning")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);

  const handleExploreClick = (event) => {
    // If already on the Courses page, scroll immediately instead of
    // relying on a route change to the same URL.
    if (location.pathname === "/courses") {
      const target = document.getElementById("popular-learning");

      if (target) {
        event.preventDefault();

        window.history.replaceState(
          null,
          "",
          `${location.pathname}${location.search}#popular-learning`,
        );

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`course-hero ${isVisible ? "course-hero-visible" : ""}`}
      aria-labelledby="course-hero-title"
    >
      <div
        className="course-hero-decoration course-hero-decoration-left"
        aria-hidden="true"
      />

      <div
        className="course-hero-decoration course-hero-decoration-right"
        aria-hidden="true"
      />

      <div className="course-hero-container">
        {/* Heading and description */}
        <div className="course-hero-content">
          <div className="course-hero-eyebrow course-reveal">
            <span>EXPLORE</span>
            <span className="course-hero-dot">•</span>
            <span>LEARN</span>
            <span className="course-hero-dot">•</span>
            <span>BUILD</span>
          </div>

          <h1 id="course-hero-title" className="course-reveal">
            Build Skills.
            <span>Create Projects.</span>
            Shape the Future.
          </h1>

          <p className="course-hero-description course-reveal">
            Learn IoT, electronics, robotics, coding and AI through practical,
            project-based courses designed for curious young learners.
          </p>
        </div>

        {/* Hero image */}
        <div className="course-hero-visual course-reveal">
          <div className="course-hero-visual-glow" aria-hidden="true" />

          <img
            src={courseHeroImage}
            alt="Robotics rover, coding laptop, friendly robot and electronics learning equipment"
            className="course-hero-image"
            fetchPriority="high"
          />

          {floatingTopics.map((topic, index) => {
            const Icon = topic.icon;

            return (
              <div
                key={topic.label}
                className={`course-topic ${topic.className}`}
                style={{ "--topic-delay": `${index * 0.3}s` }}
              >
                <span className="course-topic-icon">
                  <Icon size={25} strokeWidth={2.3} aria-hidden="true" />
                </span>
                <span className="course-topic-label">{topic.label}</span>
              </div>
            );
          })}
        </div>

        {/* Buttons: below image on tablet and mobile */}
        <div className="course-hero-actions course-reveal">
          <Link
            to="/courses#popular-learning"
            onClick={handleExploreClick}
            className="course-hero-primary"
            aria-label="Explore courses and go to Popular Learning"
          >
            <GraduationCap size={23} strokeWidth={2.2} />
            <span>Explore Courses</span>
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>

          <a href="#course-discover" className="course-hero-secondary">
            <span className="course-hero-play">
              <Play size={15} fill="currentColor" />
            </span>
            <span>Discover Learning</span>
          </a>
        </div>
      </div>

      <div className="course-hero-stats">
        {stats.map((stat, index) => (
          <div
            className={`course-stat-reveal ${isVisible ? "stat-visible" : ""}`}
            style={{ "--stat-delay": `${index * 100}ms` }}
            key={stat.label}
          >
            <StatCard stat={stat} active={isVisible} />
          </div>
        ))}
      </div>
    </section>
  );
}
