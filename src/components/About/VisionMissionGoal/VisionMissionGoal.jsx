import { useEffect, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  Target,
  Sparkles,
  Wrench,
  Users,
  Brain,
  Code2,
  Rocket,
} from "lucide-react";

import visionImage from "../../../assets/About/VisionMissionGoal/vision.png";
import missionImage from "../../../assets/About/VisionMissionGoal/mission.png";
import goalImage from "../../../assets/About/VisionMissionGoal/goal.png";

import "./VisionMissionGoal.css";

/* =========================================================
   VISION / MISSION / GOAL DATA
========================================================= */

const slides = [
  {
    id: "vision",
    number: "01",
    tab: "Vision",
    accent: "#1599df",
    label: "OUR VISION",
    icon: Eye,
    heading: (
      <>
        A future where every
        <br />
        child is a <span>creator,</span>
        <br />
        not just a consumer.
      </>
    ),
    description:
      "We envision a world where every child has the confidence, skills and opportunities to use technology to solve real problems and create a better tomorrow.",
    image: visionImage,
    features: [
      {
        icon: Lightbulb,
        title: "Curious Minds",
        text: "Explore and discover",
        className: "vision-yellow",
      },
      {
        icon: Rocket,
        title: "Creative Ideas",
        text: "Imagine without limits",
        className: "vision-purple",
      },
      {
        icon: Sparkles,
        title: "Bright Future",
        text: "Skills for tomorrow",
        className: "vision-green",
      },
    ],
    theme: "theme-vision",
  },
  {
    id: "mission",
    number: "02",
    tab: "Mission",
    accent: "#1599df",
    label: "OUR MISSION",
    icon: Lightbulb,
    heading: (
      <>
        To make technology
        <br />
        learning <span>simple, practical</span>
        <br />
        and <span>exciting</span> for every child.
      </>
    ),
    description:
      "We provide hands-on learning experiences that help children understand, build and explore technology in a fun and engaging way.",
    image: missionImage,
    features: [
      {
        icon: Wrench,
        title: "Learn by Doing",
        text: "Build instead of watching",
        className: "mission-blue",
      },
      {
        icon: Code2,
        title: "Real Projects",
        text: "Turn ideas into reality",
        className: "mission-cyan",
      },
      {
        icon: Users,
        title: "Guided Learning",
        text: "Learn with support",
        className: "mission-orange",
      },
    ],
    theme: "theme-mission",
  },
  {
    id: "goal",
    number: "03",
    tab: "Goal",
    accent: "#703be8",
    label: "OUR GOAL",
    icon: Target,
    heading: (
      <>
        To build a generation
        <br />
        of <span className="purple-text">curious, creative</span> and
        <br />
        <span>future-ready problem solvers.</span>
      </>
    ),
    description:
      "We aim to empower children with practical skills, innovative thinking and real-world knowledge to create meaningful solutions for a brighter future.",
    image: goalImage,
    features: [
      {
        icon: Brain,
        title: "Problem Solvers",
        text: "Think and find solutions",
        className: "goal-purple",
      },
      {
        icon: Code2,
        title: "Future Skills",
        text: "Prepare for tomorrow",
        className: "goal-blue",
      },
      {
        icon: Sparkles,
        title: "Real Impact",
        text: "Create ideas that matter",
        className: "goal-yellow",
      },
    ],
    theme: "theme-goal",
  },
];

export default function VisionMissionGoal() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");

  const activeSlide = slides[activeIndex];
  const ActiveIcon = activeSlide.icon;

  const nextSlide = () => {
    setDirection("next");
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setDirection("previous");
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const selectSlide = (index) => {
    if (index === activeIndex) return;

    setDirection(index > activeIndex ? "next" : "previous");
    setActiveIndex(index);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDirection("next");
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className="vision-mission-goal"
      aria-label="Vision Mission and Goal"
    >
      <div className="vmg-wrapper">
        {/* SECTION HEADING — MATCHES THE REFERENCE */}
        <div className="vmg-section-heading">
          <span
            className="vmg-section-heading-line"
            aria-hidden="true"
          />
          <span>About US</span>
          <span
            className="vmg-section-heading-line"
            aria-hidden="true"
          />
        </div>

        {/* MAIN CAROUSEL */}
        <div className="vmg-carousel">
          <article
            key={activeSlide.id}
            className={`vmg-slide ${direction}`}
            aria-live="polite"
          >
            {/* CONTENT */}
            <div className="vmg-content">
              <div className={`vmg-label ${activeSlide.theme}`}>
                <span className="vmg-label-icon">
                  <ActiveIcon size={25} strokeWidth={2.5} />
                </span>
                <span>{activeSlide.label}</span>
              </div>

              <h2>{activeSlide.heading}</h2>

              <p className="vmg-description">
                {activeSlide.description}
              </p>

              <div className="vmg-feature-grid">
                {activeSlide.features.map((feature) => {
                  const FeatureIcon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className={`vmg-feature ${feature.className}`}
                    >
                      <span className="vmg-feature-icon">
                        <FeatureIcon size={23} strokeWidth={2.3} />
                      </span>

                      <span className="vmg-feature-text">
                        <strong>{feature.title}</strong>
                        <small>{feature.text}</small>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* IMAGE */}
            <div className="vmg-image-area">
              <img
                src={activeSlide.image}
                alt={`${activeSlide.tab} illustration`}
                className="vmg-image"
              />
            </div>
          </article>
        </div>

        {/* CAROUSEL NAVIGATION */}
        <div className="vmg-navigation" aria-label="Carousel navigation">
          <button
            type="button"
            className="vmg-nav-button"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={27} strokeWidth={3} />
          </button>

          {/* NUMBER AND LABEL INSIDE EACH BLACK TAB BUTTON */}
          <div className="vmg-indicators">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={slide.id}
                  className={`vmg-indicator-item ${isActive ? "active" : ""}`}
                  style={{ "--indicator-accent": slide.accent }}
                >
                  <button
                    type="button"
                    className="vmg-indicator-button"
                    onClick={() => selectSlide(index)}
                    aria-label={`Go to ${slide.tab}`}
                    aria-pressed={isActive}
                  >
                    <strong className="vmg-indicator-number">
                      {slide.number}
                    </strong>
                    <span className="vmg-indicator-label">
                      {slide.tab}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="vmg-nav-button"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={27} strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  );
}
