import { usePublicContent } from "../../../hooks/usePublicContent.js";
import "./ProjectsSection.css";

export default function ProjectsSection() {
  const { items, loading, error } = usePublicContent("projects");
  const projects = items.slice(0, 6);
  return (
    <section className="projects-section">
      <div className="projects-container">
        <header>
          <h2>Project Lab</h2>
          <p>Projects published by ProJenius Kids.</p>
        </header>
        {loading ? (
          <p>Loading projects…</p>
        ) : error ? (
          <p>Projects are temporarily unavailable.</p>
        ) : !projects.length ? (
          <p>Projects added in the admin dashboard will appear here.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <article className="project-card" key={project._id}>
                <img src={project.image || ""} alt={project.title} />
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
