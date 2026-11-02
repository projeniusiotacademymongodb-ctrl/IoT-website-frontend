
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  MessageCircle,
  Tag,
  Users,
  Wifi,
} from "lucide-react";

import { formatINRPrice } from "../../utils/currency.js";
import "./CourseCard.css";

export default function CourseCard({ course = {} }) {
  const title = course.title || course.name || "Course";

  const description =
    course.description ||
    "Explore, learn, and build practical technology skills.";

  const courseIdentifier = course.slug || course.id;

  const courseUrl = courseIdentifier
    ? `/courses/${courseIdentifier}`
    : "/courses";

  const image = course.image;
  const level = course.level || "Beginner";

  const duration = course.duration ?? course.weeks;
  const students = course.students ?? course.studentCount;
  const price = course.price ?? course.fee;

  const priceText = formatINRPrice(price, null);

  const whatsappUrl = `https://wa.me/918925450473?text=${encodeURIComponent(
    `Hello ProJenius! I would like to know more about the ${title} course.`
  )}`;

  return (
    <article className="course-card">
      <div className="course-card-top">
        <div className="course-card-icon" aria-hidden="true">
          <Wifi size={26} />
        </div>

        <span className="course-card-level">{level}</span>
      </div>

      <div className="course-card-main">
        <div className="course-card-info">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        {image && (
          <div className="course-card-image">
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>

      <div className="course-card-details">
        {students != null && (
          <div className="course-card-detail">
            <Users size={17} aria-hidden="true" />
            <span>{students} Students</span>
          </div>
        )}

        {duration != null && (
          <div className="course-card-detail">
            <Clock3 size={17} aria-hidden="true" />
            <span>
              {typeof duration === "number"
                ? `${duration} weeks`
                : duration}
            </span>
          </div>
        )}

        {priceText !== null && (
          <div className="course-card-detail course-card-price">
            <Tag size={17} aria-hidden="true" />
            <span>{priceText}</span>
          </div>
        )}
      </div>

      <div className="course-card-bottom">
        {priceText !== null && (
          <div className="course-card-price-summary">
            <span className="course-card-price-label">
              Course Fee
            </span>

            <strong>{priceText}</strong>
          </div>
        )}

        <div className="course-card-actions">
          <Link to={courseUrl} className="course-card-view">
            <span>View Details</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <a
            href={whatsappUrl}
            className="course-card-enroll"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire about ${title} on WhatsApp`}
          >
            <MessageCircle size={17} aria-hidden="true" />
            <span>Enroll Now</span>
          </a>
        </div>
      </div>
    </article>
  );
}
