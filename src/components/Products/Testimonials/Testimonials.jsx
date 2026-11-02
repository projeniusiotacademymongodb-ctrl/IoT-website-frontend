/**
 * File: website-frontend/src/components/Products/Testimonials/Testimonials.jsx
 *
 * Purpose:
 * Fetch and display approved student testimonials from MongoDB.
 *
 * API:
 * GET http://localhost:5000/api/testimonials
 *
 * Features:
 * - Dynamic testimonials
 * - Approved testimonial filtering
 * - Loading, error and empty states
 * - Image URL handling
 * - YouTube video embedding
 * - Previous / Next carousel navigation
 *
 * Dependencies:
 * React, lucide-react, Testimonials.css
 */

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Play,
  Quote,
} from "lucide-react";

import "./Testimonials.css";


// ======================================================
// API CONFIGURATION
// ======================================================

const RAW_API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "")
).trim().replace(/\/+$/, "");

if (RAW_API_BASE_URL.includes(",")) {
  throw new Error(
    "Invalid VITE_API_BASE_URL. Configure only one backend URL."
  );
}

const API_BASE_URL = RAW_API_BASE_URL
  ? (/\/api$/i.test(RAW_API_BASE_URL) ? RAW_API_BASE_URL : `${RAW_API_BASE_URL}/api`)
  : "";

const API_ORIGIN = API_BASE_URL ? new URL(API_BASE_URL).origin : "";
const API_URL = API_BASE_URL ? `${API_BASE_URL}/testimonials` : "";


// ======================================================
// RESPONSE HELPER
// ======================================================

function extractTestimonials(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.testimonials)) {
    return data.testimonials;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  throw new Error(
    "Invalid testimonials API response."
  );
}


// ======================================================
// APPROVAL FILTER
// ======================================================

function isApproved(item) {
  // Prefer approved field because the public
  // backend endpoint filters using approved: true.

  if (typeof item.approved === "boolean") {
    return item.approved;
  }

  if (typeof item.published === "boolean") {
    return item.published;
  }

  if (typeof item.isPublished === "boolean") {
    return item.isPublished;
  }

  return true;
}


// ======================================================
// IMAGE URL HELPER
// ======================================================

function getImageUrl(item) {
  const image = String(
    item.thumbnailUrl ||
    item.thumbnailImage ||
    item.thumbnail ||
    item.image ||
    ""
  ).trim();

  if (!image) {
    return "";
  }

  if (
    image.startsWith("data:image/") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  try {
    return new URL(image, `${API_ORIGIN}/`).href;
  } catch {
    return "";
  }
}


// ======================================================
// VIDEO URL HELPER
// ======================================================

function getVideoUrl(item) {
  return (
    item.videoUrl ||
    item.videoURL ||
    item.video ||
    item.videoLink ||
    ""
  );
}


// ======================================================
// YOUTUBE EMBED URL
// ======================================================

function resolveVideoUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  try {
    return new URL(url, `${API_ORIGIN}/`).href;
  } catch {
    return "";
  }
}

function getEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      let id = host === "youtu.be"
        ? parsed.pathname.split("/").filter(Boolean)[0]
        : parsed.searchParams.get("v");
      if (!id) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0])) id = parts[1];
      }
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : "";
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?autoplay=1` : "";
    }

    if (host === "instagram.com") {
      const match = parsed.pathname.match(/^\/(?:p|reel|tv)\/([^/]+)/);
      return match ? `https://www.instagram.com/${parsed.pathname.split("/").filter(Boolean)[0]}/${match[1]}/embed/` : "";
    }
  } catch {
    return "";
  }

  return "";
}

function isDirectVideo(url) {
  return /\.(?:mp4|webm|ogg|mov)(?:$|[?#])/i.test(String(url || ""));
}


// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeVideo, setActiveVideo] = useState(null);


  // ====================================================
  // FETCH TESTIMONIALS FROM MONGODB
  // ====================================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTestimonials() {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error("Website API is not configured. Set VITE_API_BASE_URL to your deployed website-backend URL ending in /api, then redeploy the frontend.");
        }

        const response = await fetch(API_URL, {
          method: "GET",

          headers: {
            Accept: "application/json",
          },

          signal: controller.signal,
        });

        const responseText = await response.text();

        let data = null;

        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch {
            throw new Error(
              "Testimonials API returned invalid JSON."
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
            `Testimonials API failed with status ${response.status}.`
          );
        }

        if (!data) {
          throw new Error(
            "Testimonials API returned an empty response."
          );
        }

        const items = extractTestimonials(data);

        const visibleItems = items.filter(isApproved);

        if (!controller.signal.aborted) {
          setTestimonials(visibleItems);
          setOffset(0);
          setActiveVideo(null);
        }

      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          console.error(
            "Testimonials API error:",
            err
          );

          setTestimonials([]);

          setError(err.message || "Unable to load testimonials.");
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTestimonials();

    return () => {
      controller.abort();
    };

  }, []);


  // ====================================================
  // PREVIOUS TESTIMONIAL
  // ====================================================

  function showPrevious() {
    setOffset((current) => {
      return (
        current - 1 + testimonials.length
      ) % testimonials.length;
    });

    setActiveVideo(null);
  }


  // ====================================================
  // NEXT TESTIMONIAL
  // ====================================================

  function showNext() {
    setOffset((current) => {
      return (current + 1) % testimonials.length;
    });

    setActiveVideo(null);
  }


  // ====================================================
  // CAROUSEL ORDER
  // ====================================================

  const orderedTestimonials =
    testimonials.length > 0
      ? testimonials.map((_, index) => {
          return testimonials[
            (index + offset) % testimonials.length
          ];
        })
      : [];


  // ====================================================
  // LOADING STATE
  // ====================================================

  if (loading) {
    return (
      <section
        className="product-testimonials products-shell"
        aria-live="polite"
      >
        <p role="status">
          Loading student testimonials...
        </p>
      </section>
    );
  }


  // ====================================================
  // ERROR STATE
  // ====================================================

  if (error) {
    return (
      <section
        className="product-testimonials products-shell"
        aria-labelledby="testimonials-title"
      >
        <div className="products-section-heading">
          <span className="section-kicker">
            <i aria-hidden="true" />
            <span>Student Testimonials</span>
            <i aria-hidden="true" />
          </span>

          <h2 id="testimonials-title">
            Hear From Our <em>Students</em>
          </h2>
        </div>

        <p className="testimonial-error" role="alert">
          Testimonials could not be loaded.
          Please check the website backend connection.
        </p>

        {import.meta.env.DEV && (
          <small className="testimonial-error-details">
            {error}
          </small>
        )}
      </section>
    );
  }


  // ====================================================
  // EMPTY STATE
  // ====================================================

  if (testimonials.length === 0) {
    return (
      <section
        className="product-testimonials products-shell"
        aria-labelledby="testimonials-title"
      >
        <div className="products-section-heading">
          <span className="section-kicker">
            <i aria-hidden="true" />
            <span>Student Testimonials</span>
            <i aria-hidden="true" />
          </span>

          <h2 id="testimonials-title">
            Hear From Our <em>Students</em>
          </h2>

          <p>
            Student experiences and projects shared by our learners.
          </p>
        </div>

        <p className="testimonial-empty">
          No approved student testimonials available yet.
        </p>
      </section>
    );
  }


  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <section
      className="product-testimonials products-shell"
      aria-labelledby="testimonials-title"
    >

      {/* SECTION HEADING */}

      <div
        className="products-section-heading"
        data-animate="fade-up"
      >
        <span className="section-kicker">
          <i aria-hidden="true" />
          <span>Student Testimonials</span>
          <i aria-hidden="true" />
        </span>

        <h2 id="testimonials-title">
          Hear From Our <em>Students</em>
        </h2>

        <p>
          Student experiences and projects shared by our learners.
        </p>
      </div>


      {/* CAROUSEL CONTROLS */}

      {testimonials.length > 1 && (
        <div className="testimonial-controls">

          <button
            type="button"
            aria-label="Previous testimonials"
            onClick={showPrevious}
          >
            <ArrowLeft size={20} />
          </button>

          <button
            type="button"
            aria-label="Next testimonials"
            onClick={showNext}
          >
            <ArrowRight size={20} />
          </button>

        </div>
      )}


      {/* TESTIMONIAL GRID */}

      <div className="testimonial-grid">

        {orderedTestimonials.map((item, index) => {
          const name =
            item.studentName ||
            item.name ||
            "Student";

          const role =
            item.role ||
            item.year ||
            "";

          const kit =
            item.course ||
            item.kit ||
            item.courseLabel ||
            "";

          const quote =
            item.quote ||
            item.message ||
            "";

          const duration =
            item.duration ||
            item.videoDuration ||
            "";

          const image = getImageUrl(item);

          const rawVideoUrl = getVideoUrl(item);

          const videoUrl = resolveVideoUrl(rawVideoUrl);
          const embedUrl = getEmbedUrl(videoUrl);
          const directVideo = isDirectVideo(videoUrl);

          const itemId =
            item._id ||
            item.id ||
            `${name}-${index}`;


          return (
            <article
              className="testimonial-card"
              key={itemId}
              data-animate="fade-up"
              data-delay={Math.min(index + 1, 5)}
            >

              {/* TESTIMONIAL IMAGE */}

              <div className="testimonial-media">

                {activeVideo === itemId && videoUrl ? (
                  <div className="testimonial-video-player">
                    {directVideo ? (
                      <video src={videoUrl} controls autoPlay playsInline preload="metadata">
                        Your browser does not support video playback.
                      </video>
                    ) : embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={`${name} testimonial video`}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer">Open testimonial video</a>
                    )}
                    <button type="button" className="testimonial-video-close" onClick={() => setActiveVideo(null)} aria-label="Close testimonial video">×</button>
                  </div>
                ) : image ? (
                  <img
                    src={image}
                    alt={`${name} testimonial thumbnail`}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="testimonial-image-placeholder">No thumbnail available</div>
                )}

                {duration && activeVideo !== itemId && (
                  <span className="testimonial-duration">{duration}</span>
                )}

                {videoUrl && activeVideo !== itemId && (
                  <button
                    type="button"
                    className="testimonial-play"
                    aria-label={`Play testimonial from ${name}`}
                    onClick={() => setActiveVideo(itemId)}
                  >
                    <Play size={22} fill="currentColor" />
                  </button>
                )}

              </div>


              {/* TESTIMONIAL DETAILS */}

              <div className="testimonial-body">

                <Quote
                  className="testimonial-quote-icon"
                  size={22}
                  aria-hidden="true"
                />

                {quote && (
                  <p>{quote}</p>
                )}

                <div className="testimonial-person">

                  {image && (
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div>
                    <strong>{name}</strong>

                    {role && (
                      <small>{role}</small>
                    )}
                  </div>

                  {kit && (
                    <span className="testimonial-kit">
                      {kit}
                    </span>
                  )}

                </div>

              </div>

            </article>
          );
        })}

      </div>

    </section>
  );
}