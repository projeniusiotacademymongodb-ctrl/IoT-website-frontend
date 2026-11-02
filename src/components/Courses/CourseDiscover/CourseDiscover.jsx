import { ArrowRight, PlayCircle, Cpu, Lightbulb, Code2 } from "lucide-react";

import "./CourseDiscover.css";

const highlights = [
  {
    icon: Cpu,
    label: "Modern Technology",
  },
  {
    icon: Lightbulb,
    label: "Creative Thinking",
  },
  {
    icon: Code2,
    label: "Practical Projects",
  },
];

export default function CourseDiscover() {
  return (
    <section
      id="course-discover"
      className="course-discover"
      aria-labelledby="course-discover-title"
    >
      <div className="course-discover__container">
        {/* LEFT CONTENT */}
        <div className="course-discover__content">
          <div className="course-discover__eyebrow">
            <span />
            <strong>COURSE DISCOVERY</strong>
            <span />
          </div>

          <h2 id="course-discover-title">
            Discover technology.
            <br />
            Learn by <span>creating,</span>
            <br />
            not just watching.
          </h2>

          <div className="course-discover__underline" aria-hidden="true" />

          <p className="course-discover__description">
            Explore the exciting world of IoT, Robotics, Coding and Electronics
            through practical learning. Turn curiosity into creativity and
            transform ideas into real-world projects with guided hands-on
            experiences.
          </p>

          {/* HIGHLIGHTS */}
          <div className="course-discover__highlights">
            {highlights.map(({ icon: Icon, label }) => (
              <div className="course-discover__highlight" key={label}>
                <span className="course-discover__highlight-icon">
                  <Icon size={19} strokeWidth={2.4} />
                </span>

                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="course-discover__actions">
            <a
              href="#popular-learning"
              className="course-discover__button course-discover__button-primary"
            >
              Explore Courses
              <ArrowRight size={19} />
            </a>

            <a
              href="#course-discover-video"
              className="course-discover__button course-discover__button-secondary"
            >
              Watch Overview
              <PlayCircle size={19} />
            </a>
          </div>
        </div>

        {/* RIGHT YOUTUBE VIDEO */}
        <div className="course-discover__visual" id="course-discover-video">
          <div className="course-discover__visual-glow" />

          <div className="course-discover__video-frame">
            <iframe
              src="https://www.youtube.com/embed/4waq9pe9ItE?si=1D7om5wndZZaKa_6"
              title="ProJenius Course Discovery - Technology Learning"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="course-discover__video-caption">
            <span className="course-discover__play-icon">
              <PlayCircle size={21} />
            </span>

            <span>
              <strong>Discover. Explore. Create.</strong>
              <small>Experience hands-on technology learning</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
