/**
 * File: website-frontend/src/components/Products/ProjectShowcase/ProjectShowcase.jsx
 *
 * Purpose:
 * Display dynamic IoT projects from MongoDB.
 *
 * API:
 * GET /api/projects
 *
 * MongoDB Model:
 * ProjectLab
 *
 * Supported fields:
 * title, description, category, image, technologies, active
 *
 * Features:
 * - Dynamic project fetching
 * - Dynamic category filters
 * - Responsive project cards
 * - Image URL handling
 * - Image fallback
 * - Loading, error and empty states
 * - Project-specific WhatsApp enquiry
 *
 * Dependencies:
 * React, React Router, Lucide React
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Cloud,
  Cpu,
  House,
  Leaf,
  Lightbulb,
  LockKeyhole,
  Recycle,
  Sprout,
  Sun,
  Wifi,
  Wrench,
  HeartPulse,
} from "lucide-react";

import { usePublicContent } from "../../../hooks/usePublicContent.js";
import { wphone } from "../../../config/site.js";

import "./ProjectShowcase.css";


// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).trim().replace(/\/+$/, "");

function getApiOrigin() {
  try {
    return new URL(
      API_BASE_URL,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    ).origin;
  } catch {
    return "http://localhost:5000";
  }
}

const API_ORIGIN = getApiOrigin();


// ======================================================
// WHATSAPP CONFIGURATION
// ======================================================

const WHATSAPP_MESSAGE =
  "Hello ProJenius, I want to explore your IoT projects and kits. Please guide me.";

function getWhatsAppUrl(projectTitle = "") {
  const phone = String(wphone || "").replace(/\D/g, "");

  if (!phone) {
    return "";
  }

  const message = projectTitle
    ? `${WHATSAPP_MESSAGE}\n\nProject: ${projectTitle}`
    : WHATSAPP_MESSAGE;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}


// ======================================================
// IMAGE URL HELPER
// ======================================================

function resolveImageUrl(value) {
  const image = String(value || "").trim();

  if (!image) {
    return "";
  }

  // External images and data URLs.
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (/^data:image\//i.test(image)) {
    return image;
  }

  if (/^blob:/i.test(image)) {
    return image;
  }

  try {
    // Relative paths such as:
    // uploads/project.jpg
    // /uploads/project.jpg

    const normalizedPath = image.startsWith("/")
      ? image
      : `/${image}`;

    const resolved = new URL(
      normalizedPath,
      API_ORIGIN
    );

    if (
      resolved.protocol !== "http:" &&
      resolved.protocol !== "https:"
    ) {
      return "";
    }

    return resolved.href;

  } catch (error) {
    console.error("Invalid project image URL:", error);
    return "";
  }
}


// ======================================================
// CATEGORY ICON
// ======================================================

function getCategoryIcon(category = "") {
  const value = String(category).toLowerCase();

  if (value.includes("robot")) return Wrench;

  if (value.includes("home")) return House;

  if (
    value.includes("environment") ||
    value.includes("agri")
  ) {
    return Sprout;
  }

  if (
    value.includes("energy") ||
    value.includes("solar")
  ) {
    return Sun;
  }

  if (
    value.includes("health") ||
    value.includes("wearable")
  ) {
    return HeartPulse;
  }

  if (value.includes("security")) {
    return LockKeyhole;
  }

  if (
    value.includes("weather") ||
    value.includes("air")
  ) {
    return Cloud;
  }

  if (value.includes("waste")) {
    return Recycle;
  }

  if (value.includes("iot")) {
    return Wifi;
  }

  return Lightbulb;
}


// ======================================================
// CATEGORY COLOR
// ======================================================

function getCategoryTone(category = "") {
  const value = String(category).toLowerCase();

  if (value.includes("robot")) {
    return "purple";
  }

  if (
    value.includes("energy") ||
    value.includes("solar")
  ) {
    return "yellow";
  }

  if (
    value.includes("health") ||
    value.includes("security")
  ) {
    return "red";
  }

  if (
    value.includes("home") ||
    value.includes("iot")
  ) {
    return "blue";
  }

  return "green";
}


// ======================================================
// PROJECT IMAGE COMPONENT
// ======================================================

function ProjectImage({ project, imageUrl, category }) {
  const [imageFailed, setImageFailed] = useState(false);

  const Icon = getCategoryIcon(category);

  const title =
    String(project.title || "").trim() || "IoT Project";

  return (
    <div className="project-image">

      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="project-image-placeholder">
          <Icon size={38} aria-hidden="true" />
          <span>
            {imageUrl
              ? "Image unavailable"
              : "No project image"}
          </span>
        </div>
      )}

      {category && (
        <span className={`project-tag tag-${getCategoryTone(category)}`}>
          <Icon size={17} aria-hidden="true" />
          {category}
        </span>
      )}

    </div>
  );
}


// ======================================================
// PROJECT CARD
// ======================================================

function ProjectCard({ project, index }) {
  const title =
    String(project.title || "").trim() || "Untitled Project";

  const description =
    String(project.description || "").trim();

  const category =
    String(project.category || "").trim();

  const imageValue =
    project.image ||
    project.imageUrl ||
    project.thumbnailUrl ||
    "";

  const imageUrl = resolveImageUrl(imageValue);

  const technologies = Array.isArray(project.technologies)
    ? project.technologies.filter(
        (technology) =>
          typeof technology === "string" &&
          technology.trim()
      )
    : [];

  const whatsappUrl = getWhatsAppUrl(title);

  const projectId =
    project._id ||
    project.id ||
    `${title}-${index}`;

  return (
    <article
      className="project-card"
      key={projectId}
    >

      {/* PROJECT IMAGE */}

      <ProjectImage
        project={project}
        imageUrl={imageUrl}
        category={category}
      />


      {/* PROJECT DETAILS */}

      <div className="project-card-copy">

        <h3>{title}</h3>

        {description && (
          <p>{description}</p>
        )}

        {!description && (
          <p className="project-no-description">
            Project description not available.
          </p>
        )}

        {/* TECHNOLOGIES */}

        {technologies.length > 0 && (
          <div className="project-technologies">
            {technologies.map((technology, technologyIndex) => (
              <span key={`${technology}-${technologyIndex}`}>
                {technology}
              </span>
            ))}
          </div>
        )}

        {/* WHATSAPP ENQUIRY */}

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ask about ${title}`}
            title={`Enquire about ${title}`}
          >
            <ArrowUpRight size={21} aria-hidden="true" />
          </a>
        )}

      </div>

    </article>
  );
}


// ======================================================
// MAIN PROJECT SHOWCASE
// ======================================================

export default function ProjectShowcase() {

  // Fetch projects from the website backend.
  const {
    items = [],
    loading,
    error,
  } = usePublicContent("projects");

  const [active, setActive] = useState("All Projects");


  // ====================================================
  // FILTER ACTIVE PROJECTS
  // ====================================================

  const projects = useMemo(() => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (project) =>
        project &&
        project.active !== false
    );

  }, [items]);


  // ====================================================
  // DYNAMIC CATEGORY LIST
  // ====================================================

  const categories = useMemo(() => {
    const categoryNames = [
      ...new Set(
        projects
          .map((project) =>
            String(project.category || "").trim()
          )
          .filter(Boolean)
      ),
    ];

    return [
      "All Projects",
      ...categoryNames,
    ];

  }, [projects]);


  // ====================================================
  // RESET INVALID CATEGORY
  // ====================================================

  const selectedCategoryExists =
    active === "All Projects" ||
    categories.includes(active);

  const currentCategory = selectedCategoryExists
    ? active
    : "All Projects";


  // ====================================================
  // FILTER PROJECTS
  // ====================================================

  const shown = useMemo(() => {
    if (currentCategory === "All Projects") {
      return projects;
    }

    return projects.filter(
      (project) =>
        String(project.category || "").trim() === currentCategory
    );

  }, [projects, currentCategory]);


  // ====================================================
  // MAIN WHATSAPP URL
  // ====================================================

  const whatsappUrl = getWhatsAppUrl();


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <section
      className="project-showcase products-shell"
      id="project-showcase"
      aria-labelledby="project-title"
      aria-busy={loading}
    >

      {/* ================================================
          SECTION HEADING
      ================================================= */}

      <div className="products-section-heading">

        <span className="section-kicker">
          <i aria-hidden="true" />
          <span>Project Showcase</span>
          <i aria-hidden="true" />
        </span>

        <h2 id="project-title">
          What Can You <em>Build?</em>
        </h2>

        <p>
          Explore the projects and prototypes published by our team.
        </p>

      </div>


      {/* ================================================
          CATEGORY FILTERS
      ================================================= */}

      {!loading && !error && projects.length > 0 && (
        <div
          className="project-filter-row"
          role="group"
          aria-label="Filter projects by category"
        >

          {categories.map((category) => {
            const Icon =
              category === "All Projects"
                ? Cpu
                : getCategoryIcon(category);

            return (
              <button
                type="button"
                key={category}
                onClick={() => setActive(category)}
                className={`project-filter ${
                  currentCategory === category
                    ? "active"
                    : ""
                }`}
                aria-pressed={currentCategory === category}
              >
                <Icon
                  size={20}
                  aria-hidden="true"
                />

                <span>{category}</span>
              </button>
            );
          })}

        </div>
      )}


      {/* ================================================
          PROJECT GRID
      ================================================= */}

      <div
        className="project-grid"
        aria-live="polite"
      >

        {/* LOADING */}

        {loading && (
          <p
            className="project-empty"
            role="status"
          >
            Loading projects...
          </p>
        )}


        {/* API ERROR */}

        {!loading && error && (
          <div
            className="project-empty"
            role="alert"
          >
            <p>
              Projects are temporarily unavailable.
            </p>

            {import.meta.env.DEV && (
              <small>{error}</small>
            )}
          </div>
        )}


        {/* EMPTY STATE */}

        {!loading && !error && shown.length === 0 && (
          <p className="project-empty">

            {projects.length === 0
              ? "Projects published from the Admin Dashboard will appear here."
              : "No projects found in this category."}

          </p>
        )}


        {/* DYNAMIC MONGODB PROJECTS */}

        {!loading && !error && shown.length > 0 && (
          shown.map((project, index) => (
            <ProjectCard
              key={project._id || project.id || `${project.title}-${index}`}
              project={project}
              index={index}
            />
          ))
        )}

      </div>


      {/* ================================================
          CALL TO ACTION
      ================================================= */}

      <div className="project-cta">

        <span className="project-cta-icon">
          <Lightbulb
            size={32}
            aria-hidden="true"
          />
        </span>


        <div className="project-cta-copy">

          <strong>
            Have a project idea?
          </strong>

          <p>
            Our kits help you turn your ideas into real working prototypes.
          </p>

        </div>


        <Link
          to="/#project-lab"
          className="products-btn products-btn-primary"
        >
          <Cpu
            size={20}
            aria-hidden="true"
          />

          Explore Our Kits

          <ArrowRight
            size={19}
            aria-hidden="true"
          />
        </Link>

      </div>

    </section>
  );
}