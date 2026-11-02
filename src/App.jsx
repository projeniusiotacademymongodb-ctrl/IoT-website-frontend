import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Reveal from "./components/Home/Reveal.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";

import Home from "./pages/Home/Home.jsx";
import About from "./pages/About/About.jsx";
import Pricing from "./pages/Pricing/Pricing.jsx";
import FAQs from "./pages/FAQs/FAQs.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import Products from "./pages/Products/Products.jsx";

import { Courses, CourseDetails } from "./pages/Courses/Courses.jsx";
import { Blog, BlogDetails } from "./pages/Blog/Blog.jsx";
import { Privacy, Terms } from "./pages/Legal/Legal.jsx";

/* Scope reveal styles so the page remains readable if JavaScript is disabled. */
if (typeof document !== "undefined") {
  document.documentElement.classList.add("has-scroll-animations");
}

const REVEAL_SELECTOR = [
  "[data-animate]",
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "img",
  "picture",
  "blockquote",
  "li",
  "button",
  "a.primary-btn",
  "a.secondary-btn",
  "a.cta-button",
  '[class*="card"]',
  '[class*="tile"]',
  '[class*="stat"]',
  '[class*="step"]',
  '[class*="feature"]',
].join(",");

function isInsideAnimatedElement(element) {
  return Boolean(element.parentElement?.closest("[data-animate]"));
}

function prepareRevealElements() {
  const sections = document.querySelectorAll(
    "main, section, article, footer, [data-reveal-section]"
  );

  sections.forEach((section) => {
    const candidates = Array.from(section.querySelectorAll(REVEAL_SELECTOR));
    let delayIndex = 0;

    candidates.forEach((element) => {
      // Keep filter controls permanently visible; global reveal animations can hide them
      // when the observer removes the visible class after a filter click.
      if (
        element.matches(".product-filter-row, .project-filter-row, .gallery-filter-row, .project-filters, .blogs-categories, .popular-category-filter") ||
        element.closest(".product-filter-row, .project-filter-row, .gallery-filter-row, .project-filters, .blogs-categories, .popular-category-filter")
      ) {
        element.classList.add("filter-control-visible");
        return;
      }

 // Keep existing hand-authored animation settings intact.
      if (element.hasAttribute("data-animate")) return;

      // Avoid nested hidden elements inside a card or manually animated wrapper.
      if (isInsideAnimatedElement(element)) return;

      const tag = element.tagName.toLowerCase();
      const className =
        typeof element.className === "string" ? element.className.toLowerCase() : "";

      let animation = "fade-up";

      if (tag === "img" || tag === "picture" || className.includes("image")) {
        animation = "zoom";
      } else if (
        className.includes("card") ||
        className.includes("tile") ||
        className.includes("feature") ||
        className.includes("stat") ||
        className.includes("step")
      ) {
        animation = "pop";
      } else if (tag === "li") {
        animation = "fade-right";
      }

      element.setAttribute("data-animate", animation);

      // Stagger a small number of elements; avoid long delays in large lists.
      const delay = Math.min(delayIndex, 5) + 1;
      element.setAttribute("data-delay", String(delay));
      delayIndex += 1;
    });
  });

  return document.querySelectorAll("[data-animate]");
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

/**
 * Global reveal observer:
 * - covers every route and section
 * - handles elements rendered later
 * - removes the visible class off-screen so reveals replay on return
 * - disconnects all observers when the route changes or component unmounts
 */
function ScrollAnimations() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let observer;
    let mutationObserver;

    const observeCurrentElements = () => {
      const elements = prepareRevealElements();

      if (reducedMotion || typeof IntersectionObserver === "undefined") {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
      }

      elements.forEach((element) => observer.observe(element));
    };

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      observeCurrentElements();
      return undefined;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    observeCurrentElements();

    // React route content and CMS-driven lists may be inserted after mount.
    mutationObserver = new MutationObserver((records) => {
      const hasNewElements = records.some((record) =>
        Array.from(record.addedNodes).some(
          (node) => node.nodeType === Node.ELEMENT_NODE
        )
      );

      if (hasNewElements) observeCurrentElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="app">
      <Reveal />
      <ScrollToTop />
      <ScrollAnimations />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />

        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />

        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faqs" element={<FAQs />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetails />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
