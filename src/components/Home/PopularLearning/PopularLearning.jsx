import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Clock3,
  Code2,
  Cpu,
  MessageCircle,
  Tag,
  UserRound,
  Wifi,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { usePublicContent } from "../../../hooks/usePublicContent.js";
import { openTrackedWhatsApp } from "../../../utils/whatsapp.js";
import Reveal from "../Reveal.jsx";

import "./PopularLearning.css";

const icons = {
  wifi: Wifi,
  cpu: Cpu,
  bot: Bot,
  zap: Zap,
  code: Code2,
  brain: Cpu,
  settings: Cpu,
};

const tones = {
  iot: "blue",
  arduino: "green",
  robotics: "purple",
  electronics: "yellow",
  coding: "pink",
  ai: "mint",
  "iot-robotics": "purple",
};

function formatPrice(price) {
  if (price === null || price === undefined || price === "") return "Contact us";

  const formatINR = (amount) => `₹ ${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  if (typeof price === "number") return Number.isFinite(price) ? formatINR(price) : "Contact us";

  const value = String(price).trim();
  if (!value) return "Contact us";

  const normalized = value
    .replace(/^(?:₱|₹|PHP|INR|Rs\.?)\s*/i, "")
    .replace(/\s*(?:PHP|INR|Rs\.?)$/i, "")
    .replace(/,/g, "")
    .trim();

  if (/^\d+(?:\.\d{1,2})?$/.test(normalized)) return formatINR(Number(normalized));

  // Legacy values can include a currency prefix before the amount.
  const amountMatch = value.match(/(?:₱|₹|PHP|INR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (amountMatch) return formatINR(Number(amountMatch[1].replace(/,/g, "")));

  return value.replace(/₱/g, "₹").replace(/\bPHP\s*/gi, "₹ ").replace(/\bINR\s*/gi, "₹ ").replace(/\bRs\.?\s*/gi, "₹ ");
}

function getCategoryKey(category) {
  return String(category || "")
    .trim()
    .toLowerCase();
}

export default function PopularLearning() {
  const {
    items: apiCourses = [],
    loading,
    error,
  } = usePublicContent("courses");

  const courses = (Array.isArray(apiCourses) ? apiCourses : []).map((item) => ({
    ...item,
    id: item.slug || item._id,
    name: item.title,
    age: item.ageRange || "Ask us",
    icon:
      getCategoryKey(item.category).replace(/[^a-z]/g, "") === "robotics"
        ? "bot"
        : "wifi",
    price: item.price ?? "Contact us",
  }));

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const location = useLocation();

  const isCoursesPage = location.pathname.replace(/\/$/, "") === "/courses";

  const categories = [
    ...new Map(
      courses
        .map((course) => {
          const label = String(course.category || "").trim();

          return label
            ? [getCategoryKey(label), label]
            : null;
        })
        .filter(Boolean)
    ).entries(),
  ].map(([key, label]) => ({ key, label }));

  const filteredCourses =
    !isCoursesPage || selectedCategory === "all"
      ? courses
      : courses.filter(
          (course) => getCategoryKey(course.category) === selectedCategory
        );

  // Home page: show only the first three courses.
  // Courses page: show every course matching the selected category.
  const visibleCourses = isCoursesPage
    ? filteredCourses
    : courses.slice(0, 3);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      location.pathname !== "/courses" ||
      location.hash !== "#popular-learning"
    ) {
      return undefined;
    }

    const frameId = requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    setSelectedCategory("all");
  }, [location.pathname]);

  return (
    <section
      ref={sectionRef}
      id="popular-learning"
      className={`popular-learning${isVisible ? " popular-in-view" : ""}`}
      aria-labelledby="popular-learning-title"
    >
      <div className="popular-blob blob-one" aria-hidden="true" />
      <div className="popular-blob blob-two" aria-hidden="true" />

      <div className="popular-container">
        <Reveal>
          <div
            className={`popular-header-row${
              isCoursesPage ? " courses-page-header" : " home-page-header"
            }`}
          >
            <header className="popular-heading">
              <div className="popular-eyebrow">
                <span className="popular-eyebrow-line" aria-hidden="true" />
                <span>
                  {isCoursesPage ? "EXPLORE OUR COURSES" : "POPULAR LEARNING"}
                </span>
                <span className="popular-eyebrow-line" aria-hidden="true" />
              </div>

              <h2 id="popular-learning-title">
                Courses built around <strong>making</strong>
              </h2>

              <p>
                Choose a starting point based on age, interest and experience.
              </p>
            </header>

            {!isCoursesPage && (
              <Link
                to="/courses"
                className="popular-explore-link"
                aria-label="Explore all courses"
              >
                <span>Explore More Courses</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
        </Reveal>

        {isCoursesPage && categories.length > 0 && (
          <div
            className="popular-category-filter"
            role="group"
            aria-label="Filter courses by category"
          >
            <button
              type="button"
              className={`popular-category-button${
                selectedCategory === "all" ? " active" : ""
              }`}
              aria-pressed={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
            >
              All Courses
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category.key}
                className={`popular-category-button${
                  selectedCategory === category.key ? " active" : ""
                }`}
                aria-pressed={selectedCategory === category.key}
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="popular-loading">Loading courses…</p>
        ) : error ? (
          <p className="popular-loading">
            Courses are temporarily unavailable. Please try again soon.
          </p>
        ) : visibleCourses.length === 0 ? (
          <p className="popular-loading">
            {isCoursesPage && selectedCategory !== "all"
              ? "No courses are available in this category yet."
              : "New courses will be announced here soon."}
          </p>
        ) : (
          <div className="popular-grid">
            {visibleCourses.map((course, index) => {
              const Icon = icons[course.icon] || Cpu;

              const courseTone =
                tones[
                  getCategoryKey(course.category).replace(/[^a-z]/g, "")
                ] || "blue";

              const courseImage = course.image;
              const coursePrice = formatPrice(course.price);
              const hasDuration =
                course.duration !== null &&
                course.duration !== undefined &&
                String(course.duration).trim() !== "";

              return (
                <Reveal key={course.id || `${course.name}-${index}`} delay={index * 80}>
                  <article className={`popular-card ${courseTone}`}>
                    <div className="popular-top">
                      <div className="popular-icon">
                        <Icon size={25} aria-hidden="true" />
                      </div>

                      <span>{course.level || "Beginner"}</span>
                    </div>

                    <div className="popular-main">
                      <div className="popular-copy">
                        <h3>
                          {course.name === "Electronics & Sensors"
                            ? "Electronics Basics"
                            : course.name}
                        </h3>

                        <p>
                          {course.description ||
                            "Explore, learn, and build practical technology skills."}
                        </p>
                      </div>

                      {courseImage && (
                        <div className="popular-image">
                          <img
                            src={courseImage}
                            alt={course.name || "Course"}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                    </div>

                    <div
                      className={`popular-meta${
                        hasDuration ? " has-duration" : " single-meta"
                      }`}
                    >
                      <span
                        className="popular-meta-item"
                        title={`Age: ${course.age}`}
                      >
                        <UserRound size={19} aria-hidden="true" />
                        <span>{course.age}</span>
                      </span>

                      {hasDuration && (
                        <span
                          className="popular-meta-item"
                          title={`Duration: ${String(course.duration)}`}
                        >
                          <Clock3 size={19} aria-hidden="true" />
                          <span>{course.duration}</span>
                        </span>
                      )}
                    </div>

                    <div className="popular-price">
                      <div className="popular-price-label">
                        <Tag size={17} aria-hidden="true" />
                        <span>Course Fee</span>
                      </div>

                      <strong>{coursePrice}</strong>
                    </div>

                    <div className="popular-actions">
                      <Link
                        to={`/courses/${course.id}`}
                        aria-label={`View details for ${course.name}`}
                      >
                        <span>View Details</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          openTrackedWhatsApp({
                            source: "Popular learning course card",
                            item: course.name,
                            message: `Hello TechSprout Kids! I am interested in the ${course.name} course.`,
                          })
                        }
                        aria-label={`Enquire about ${course.name} through WhatsApp`}
                      >
                        <MessageCircle size={17} aria-hidden="true" />
                        <span>Enroll Now</span>
                      </button>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
