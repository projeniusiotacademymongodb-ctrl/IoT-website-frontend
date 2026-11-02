import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Cpu,
  FolderOpen,
  Leaf,
  Lightbulb,
  Settings,
  Wifi,
} from "lucide-react";

import { usePublicContent } from "../../../hooks/usePublicContent.js";
import Reveal from "../Reveal.jsx";
import "./ProjectLab.css";

const getCategoryKey = (value) => String(value || "").trim().toLowerCase();

function getCategoryIcon(category) {
  const value = getCategoryKey(category);
  if (value.includes("robot")) return Cpu;
  if (value.includes("plant") || value.includes("environment")) return Leaf;
  if (value.includes("home") || value.includes("iot")) return Wifi;
  if (value.includes("light") || value.includes("energy")) return Lightbulb;
  if (value.includes("automation")) return Settings;
  return Cpu;
}

export default function ProjectLab() {
  const { items: projectItems = [], loading, error } = usePublicContent("projects");
  const [activeFilter, setActiveFilter] = useState("all");
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const projects = useMemo(
    () => (Array.isArray(projectItems) ? projectItems : []).filter((item) => item && item.active !== false),
    [projectItems]
  );

  const categories = useMemo(() => {
    const seen = new Map();
    projects.forEach((project) => {
      const label = String(project.category || "").trim();
      const key = getCategoryKey(label);
      if (key && !seen.has(key)) seen.set(key, label);
    });
    return [{ key: "all", label: "All" }, ...Array.from(seen, ([key, label]) => ({ key, label }))];
  }, [projects]);

  useEffect(() => {
    if (activeFilter !== "all" && !categories.some((item) => item.key === activeFilter)) {
      setActiveFilter("all");
    }
  }, [activeFilter, categories]);

  const visibleProjects = useMemo(
    () => activeFilter === "all"
      ? projects
      : projects.filter((project) => getCategoryKey(project.category) === activeFilter),
    [projects, activeFilter]
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (location.pathname !== "/" || location.hash !== "#project-lab") return undefined;
    const frameId = requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);

  return (
    <section ref={sectionRef} id="project-lab" className={`project-lab ${isVisible ? "project-in-view" : ""}`} aria-labelledby="project-lab-title">
      <div className="project-decor decor-left" aria-hidden="true" />
      <div className="project-decor decor-right" aria-hidden="true" />

      <div className="project-container">
        <Reveal>
          <header className="project-heading">
            <div className="project-eyebrow">
              <span className="project-eyebrow-line" aria-hidden="true" />
              <span>PROJECT LAB</span>
              <span className="project-eyebrow-line" aria-hidden="true" />
            </div>
            <h2 id="project-lab-title">What kids can <strong>build</strong></h2>
            <p>Hands-on projects help children connect coding, sensors, electronics and real-world problems.</p>
          </header>
        </Reveal>

        {!loading && !error && categories.length > 1 && (
          <div className="project-filters" role="group" aria-label="Project categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category.key}
                className={activeFilter === category.key ? "active" : ""}
                aria-pressed={activeFilter === category.key}
                onClick={() => setActiveFilter(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="project-empty">Loading project lab…</p>
        ) : error ? (
          <p className="project-empty" role="alert">Projects are temporarily unavailable.</p>
        ) : visibleProjects.length === 0 ? (
          <p className="project-empty">{projects.length ? "No projects are available in this category." : "Projects added in the admin dashboard will appear here."}</p>
        ) : (
          <div className="project-grid-home" aria-live="polite">
            {visibleProjects.map((project, index) => {
              const Icon = getCategoryIcon(project.category);
              const image = String(project.image || project.imageUrl || project.thumbnailUrl || "").trim();
              return (
                <Reveal key={project._id || project.slug || project.title} delay={index * 70}>
                  <article className="project-home-card">
                    <div className={`project-home-art art-${index % 8}`}>
                      {image ? (
                        <img src={image} alt={project.title || "Project"} loading="lazy" decoding="async" />
                      ) : (
                        <div className="project-home-no-image" aria-label="No project image uploaded">
                          <Icon className="project-art-icon" size={42} aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {project.category && <span className="project-home-category">{project.category}</span>}
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <Link to="/products#project-showcase">
                      View Project <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal direction="zoom" className="all-projects-wrap">
          <Link className="all-projects" to="/products#project-showcase">
            <FolderOpen size={19} aria-hidden="true" />
            View All Projects
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
