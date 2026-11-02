import { useEffect, useRef, useState } from "react";
import {
  Lightbulb,
  ShieldCheck,
  Users,
  Settings,
  Quote,
} from "lucide-react";

import { usePublicContent } from "../../../hooks/usePublicContent.js";
import Reveal from "../Reveal.jsx";
import "./ParentSection.css";

const trustItems = [
  [
    "Safe Learning Environment",
    "A secure and supportive space for young learners.",
    ShieldCheck,
    "blue",
  ],
  [
    "Practical Education",
    "Hands-on projects that build real skills for the future.",
    Lightbulb,
    "yellow",
  ],
  [
    "Age-appropriate Learning",
    "Designed for different age groups and skill levels.",
    Users,
    "green",
  ],
  [
    "Project-based Learning",
    "Turn ideas into working models through fun projects.",
    Settings,
    "purple",
  ],
];

export default function ParentSection() {
  const { items: reviewItems = [], loading: reviewsLoading, error: reviewsError } = usePublicContent("reviews");
  const testimonials = (Array.isArray(reviewItems) ? reviewItems : [])
    .filter((item) => item && item.approved !== false && item.published !== false)
    .map((item) => [
      item.name || item.parentName || item.studentName || "Parent",
      item.message || item.quote || "",
      item.role || "Parent",
    ])
    .filter((item) => item[1]);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`parent-section${isVisible ? " parent-in-view" : ""}`}
    >
      <div className="parent-decor parent-one" />
      <div className="parent-decor parent-two" />

      <div className="parent-container">
        <Reveal>
          <header className="parent-heading">
            <div className="parent-eyebrow">
              <span className="parent-eyebrow-line" aria-hidden="true" />
              <span>WHY FAMILIES CHOOSE TECHSPROUT</span>
              <span className="parent-eyebrow-line" aria-hidden="true" />
            </div>

            <h2>
              Fun for kids. Meaningful <strong>for parents.</strong>
            </h2>

            <p>
              A learning experience designed to be playful without becoming
              childish,
              <br className="desktop-break" /> and practical without becoming
              overwhelming.
            </p>
          </header>
        </Reveal>

        <div className="trust-home-grid">
          {trustItems.map(([title, text, Icon, tone], i) => (
            <Reveal key={title} delay={i * 90}>
              <article className={`trust-home-card ${tone}`}>
                <div className="trust-icon">
                  <Icon size={30} />
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="voices-heading" delay={100}>
          <div className="voices-eyebrow">
            <span className="voices-eyebrow-line" aria-hidden="true" />
            <span>PARENT &amp; STUDENT VOICES</span>
            <span className="voices-eyebrow-line" aria-hidden="true" />
          </div>

          <h2>What learners say</h2>

          <p>
            Real stories from parents and students who are building, learning
            and growing with TechSprout.
          </p>
        </Reveal>

        <div className="testimonial-carousel">
          {reviewsLoading ? (
            <p className="reviews-empty">Loading parent and student reviews…</p>
          ) : reviewsError ? (
            <p className="reviews-empty">Reviews are temporarily unavailable.</p>
          ) : testimonials.length ? <div className="testimonial-track">
            {[...testimonials, ...testimonials].map((item, i) => (
              <article
                className="testimonial-home-card"
                key={`${item[0]}-${i}`}
              >
                <div className="testimonial-top">
                  <Quote size={25} />
                  <span>★★★★★</span>
                </div>

                <p>“{item[1]}”</p>

                <div className="testimonial-person">
                  <div className={`avatar avatar-${i % 3}`}>
                    {item[0].charAt(0)}
                  </div>

                  <div>
                    <strong>{item[0]}</strong>
                    <span>{item[2]}</span>
                  </div>
                </div>
              </article>
            ))}
          </div> : <p className="reviews-empty">Parent reviews will appear here after approval.</p>}
        </div>
      </div>
    </section>
  );
}
