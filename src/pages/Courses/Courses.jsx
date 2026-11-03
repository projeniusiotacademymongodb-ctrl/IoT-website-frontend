import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { usePublicContent } from "../../hooks/usePublicContent.js";
import { openTrackedWhatsApp } from "../../utils/whatsapp.js";

import CTASection from "../../components/CTASection/CTASection.jsx";
import CourseHero from "../../components/Courses/CourseHero/CourseHero.jsx";
import CourseDiscover from "../../components/Courses/CourseDiscover/CourseDiscover.jsx";
import WhyLearn from "../../components/Courses/WhyLearn/WhyLearn.jsx";
import PopularLearning from "../../components/Home/PopularLearning/PopularLearning.jsx";
import CourseCard from "../../components/CourseCard/CourseCard.jsx";

import "./CourseDetailsEnhancements.css";
import "./Courses.css";

import { formatINRPrice } from "../../utils/currency.js";

const courseIcons = {
  wifi: Sparkles,
  cpu: Lightbulb,
  bot: Rocket,
  zap: Sparkles,
  code: GraduationCap,
  brain: Lightbulb,
  settings: ShieldCheck,
};

const learningPoints = [
  {
    icon: Lightbulb,
    title: "Understand the concepts",
    text: "Learn the basic ideas behind the technology through simple explanations and demonstrations.",
  },
  {
    icon: Rocket,
    title: "Build practical projects",
    text: "Apply what you learn by creating models, experimenting, and solving practical challenges.",
  },
  {
    icon: ShieldCheck,
    title: "Develop problem-solving skills",
    text: "Test ideas, identify mistakes, and improve your project step by step.",
  },
];

const curriculum = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore the technology, understand where it is used, and learn the basic concepts.",
  },
  {
    number: "02",
    title: "Learn by doing",
    description:
      "Work with relevant tools, components, or software through guided activities.",
  },
  {
    number: "03",
    title: "Build a project",
    description:
      "Use your new skills to develop a practical project with step-by-step guidance.",
  },
  {
    number: "04",
    title: "Test and improve",
    description:
      "Check how your project works, fix issues, and explain what you have created.",
  },
];

export function Courses() {
  return (
    <>
      <CourseHero />
      <CourseDiscover />
      <WhyLearn />
      <PopularLearning />
      <CTASection />
    </>
  );
}

export function CourseDetails() {
  const { courseId } = useParams();

  const {
    items: apiCourses = [],
    loading,
    error,
  } = usePublicContent("courses");

  const courses = (
    Array.isArray(apiCourses) ? apiCourses : []
  ).map((item) => ({
    ...item,
    id: item.slug || item._id,
    name: item.title,
    age: item.ageRange || "Ask us",
    icon: "wifi",
    price: item.price || "Contact us",
  }));

  const course = courses.find((item) => item.id === courseId);

  const relatedCourses = useMemo(() => {
    if (!course) return [];

    const currentCategory = String(course.category || "")
      .trim()
      .toLocaleLowerCase();

    const remaining = courses.filter(
      (item) => item.id !== course.id
    );

    const sameCategory = currentCategory
      ? remaining.filter(
          (item) =>
            String(item.category || "").trim().toLocaleLowerCase() ===
            currentCategory
        )
      : [];

    const otherCategories = remaining.filter(
      (item) =>
        !sameCategory.some((match) => match.id === item.id)
    );

    return [...sameCategory, ...otherCategories].slice(0, 3);
  }, [courses, course]);

  if (loading) {
    return (
      <main className="course-detail-not-found">
        <h1>Loading course…</h1>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="course-detail-not-found">
        <div className="course-not-found-icon">
          <GraduationCap size={38} />
        </div>

        <span>COURSE NOT FOUND</span>

        <h1>Let's find the right learning path.</h1>

        <p>
          This course may have moved, is unpublished, or the link may be
          incorrect. Explore the available courses to find another option.
        </p>

        <Link to="/courses" className="course-not-found-link">
          <ArrowLeft size={18} />
          Explore All Courses
        </Link>
      </main>
    );
  }

  // Only use the image supplied by Admin.
  const image = String(course.image || "").trim();

  const Icon = courseIcons[course.icon] || GraduationCap;
  const enrollmentUrl = "#course-enquiry";

  function formatCoursePrice(value) {
    const raw = String(value ?? "").trim();

    if (!raw) return "Contact us";

    const numeric = raw
      .replace(/^(?:₱|₹|PHP|INR|Rs\.?)\s*/i, "")
      .replace(/,/g, "")
      .trim();

    if (/^\d+(?:\.\d{1,2})?$/.test(numeric)) {
      return `₹ ${Number(numeric).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`;
    }

    return raw
      .replace(/₱/g, "₹")
      .replace(/\b(?:PHP|INR|Rs\.?)\s*/gi, "₹ ");
  }

  return (
    <main className="course-detail-page">
      <section className="course-detail-hero">
        <div
          className="course-detail-hero-glow"
          aria-hidden="true"
        />

        <div className="course-detail-hero-inner">
          <div className="course-detail-hero-copy">
            <span className="course-detail-eyebrow">
              <Sparkles size={16} />
              LEARN · BUILD · CREATE
            </span>

            {course.category && (
              <span className="course-detail-category">
                {course.category}
              </span>
            )}

            <span className="course-detail-level">
              {course.level || "Practical Learning"}
            </span>

            <h1>
              Explore.
              <br />
              Experiment.
              <br />
              <strong>{course.name}.</strong>
            </h1>

            <p className="course-detail-description">
              {course.description}
            </p>

            <div className="course-detail-hero-actions">
              <button
                type="button"
                onClick={() =>
                  openTrackedWhatsApp({
                    source: "Course detail page",
                    item: course.name,
                    message: `Hi TechSprout Kids! I would like to know more about the ${course.name} course.`,
                  })
                }
                className="course-detail-primary"
              >
                <MessageCircle size={19} />
                Enquire &amp; Enroll
                <ArrowRight size={18} />
              </button>

              <a
                href="#course-curriculum"
                className="course-detail-secondary"
              >
                Explore Curriculum
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="course-detail-trust">
              <span>
                <CheckCircle2 size={16} />
                Hands-on activities
              </span>

              <span>
                <CheckCircle2 size={16} />
                Guided projects
              </span>
            </div>
          </div>

          <div className="course-detail-hero-art">
            <div className="course-art-label course-art-label-top">
              <span className="course-art-label-icon">
                <Icon size={20} />
              </span>

              <span>
                <strong>Learn by doing</strong>
                <small>Real-world concepts</small>
              </span>
            </div>

            {image ? (
              <img
                src={image}
                alt={`${course.name} course`}
                className="course-detail-main-image"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="course-detail-image-placeholder">
                <Icon size={58} aria-hidden="true" />
                <span>Course image not added by Admin</span>
              </div>
            )}

            <div className="course-art-label course-art-label-bottom">
              <Sparkles size={19} />
              <span>Ideas into projects</span>
            </div>
          </div>
        </div>
      </section>

      <section className="course-detail-info">
        <div className="course-detail-info-inner">
          <div className="course-info-item">
            <span className="course-info-icon">
              <Users size={21} />
            </span>

            <div>
              <small>Recommended age</small>
              <strong>{course.age || "Contact us"}</strong>
            </div>
          </div>

          <div className="course-info-item">
            <span className="course-info-icon">
              <Clock3 size={21} />
            </span>

            <div>
              <small>Course duration</small>
              <strong>{course.duration || "Contact us"}</strong>
            </div>
          </div>

          <div className="course-info-item">
            <span className="course-info-icon">
              <GraduationCap size={21} />
            </span>

            <div>
              <small>Learning approach</small>
              <strong>Practical learning</strong>
            </div>
          </div>

          <div className="course-info-item course-info-price">
            <span className="course-info-icon">
              <Sparkles size={21} />
            </span>

            <div>
              <small>Course fee</small>
              <strong>{formatINRPrice(course.price)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="course-detail-section course-detail-overview">
        <div className="course-detail-section-heading">
          <span className="course-section-eyebrow">
            THE LEARNING EXPERIENCE
          </span>

          <h2>
            More than learning.
            <br />
            <strong>It's about creating.</strong>
          </h2>

          <p>
            Discover how technology works by exploring ideas, trying
            activities, and turning what you learn into something practical.
          </p>
        </div>

        <div className="course-learning-points">
          {learningPoints.map((point, index) => {
            const PointIcon = point.icon;

            return (
              <article
                className="course-learning-point"
                key={point.title}
              >
                <div className="course-learning-point-top">
                  <span className="course-learning-number">
                    0{index + 1}
                  </span>

                  <span className="course-learning-icon">
                    <PointIcon size={23} />
                  </span>
                </div>

                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="course-detail-curriculum"
        id="course-curriculum"
      >
        <div className="course-curriculum-inner">
          <div className="course-curriculum-heading">
            <span className="course-section-eyebrow">
              YOUR LEARNING JOURNEY
            </span>

            <h2>
              From your first idea
              <br />
              to a <strong>working project.</strong>
            </h2>

            <p>
              A guided learning journey that helps learners understand,
              practise, build, and improve.
            </p>
          </div>

          <div className="course-curriculum-list">
            {curriculum.map((item) => (
              <article
                className="course-curriculum-item"
                key={item.number}
              >
                <span className="course-curriculum-number">
                  {item.number}
                </span>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <CheckCircle2
                  className="course-curriculum-check"
                  size={22}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="course-detail-outcomes">
        <div className="course-outcomes-visual">
          {image ? (
            <img
              src={image}
              alt={`${course.name} practical learning`}
              loading="lazy"
            />
          ) : (
            <div className="course-detail-image-placeholder course-outcomes-placeholder">
              <Icon size={58} aria-hidden="true" />
              <span>Course image not added by Admin</span>
            </div>
          )}

          <div className="course-outcomes-image-caption">
            <Lightbulb size={21} />
            <span>Think it. Build it. Improve it.</span>
          </div>
        </div>

        <div className="course-outcomes-copy">
          <span className="course-section-eyebrow">
            WHAT YOU WILL GAIN
          </span>

          <h2>
            Skills that grow
            <br />
            with <strong>every project.</strong>
          </h2>

          <p>
            This learning path encourages curiosity, creativity, and
            confidence through guided practical activities.
          </p>

          <ul>
            <li>
              <CheckCircle2 size={19} />
              Understand core concepts in a simple way
            </li>

            <li>
              <CheckCircle2 size={19} />
              Practise using relevant tools and technology
            </li>

            <li>
              <CheckCircle2 size={19} />
              Build and demonstrate a practical project
            </li>

            <li>
              <CheckCircle2 size={19} />
              Develop logical thinking and problem-solving skills
            </li>
          </ul>

          <a
            href={enrollmentUrl}
            className="course-detail-primary course-outcomes-button"
          >
            <MessageCircle size={18} />
            Ask About This Course
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section className="course-detail-cta">
        <div
          className="course-detail-cta-decoration"
          aria-hidden="true"
        />

        <div className="course-detail-cta-copy">
          <span>YOUR NEXT STEP STARTS HERE</span>

          <h2>
            Ready to build something
            <br />
            <strong>amazing?</strong>
          </h2>

          <p>
            Contact our team to learn about the course, schedule,
            availability, and enrollment.
          </p>
        </div>

        <a
          href={enrollmentUrl}
          className="course-detail-cta-button"
        >
          <MessageCircle size={20} />
          Enquire on WhatsApp
          <ArrowRight size={18} />
        </a>
      </section>

      {relatedCourses.length > 0 && (
        <section
          className="course-related-section"
          aria-labelledby="course-related-title"
        >
          <div className="course-related-heading">
            <div>
              <span className="course-section-eyebrow">
                KEEP LEARNING
              </span>

              <h2 id="course-related-title">
                Related <strong>Courses</strong>
              </h2>

              <p>
                More courses selected from the same category where available.
              </p>
            </div>

            <Link
              to="/courses"
              className="course-related-view-more"
            >
              View More
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className="course-related-grid">
            {relatedCourses.map((relatedCourse, index) => (
              <CourseCard
                key={relatedCourse._id || relatedCourse.id || index}
                course={relatedCourse}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}