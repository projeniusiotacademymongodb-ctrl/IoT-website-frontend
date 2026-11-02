import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicContent } from "../../../hooks/usePublicContent.js";
import "./Blogs.css";
import blogRobot from "../../../assets/Blog/Blogs/blog-robot.png";

const normalizeCategory = (value) => String(value || "").trim().toLowerCase();

function resolveMediaUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const configured = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!configured && import.meta.env.PROD) return url;
  const base = configured || "http://localhost:5000/api";
  const origin = new URL(base, window.location.origin).origin;
  return new URL(url.replace(/^\/+/, ""), `${origin}/`).href;
}

export default function Blogs() {
  const { items = [], loading, error } = usePublicContent("blogs");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const blogPosts = useMemo(
    () => (Array.isArray(items) ? items : []).map((post) => ({
      ...post,
      id: post.slug || post._id,
      description: post.excerpt || "",
      date: post.publishedAt || post.createdAt
        ? new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN")
        : "",
      alt: post.title || "Blog article",
      imageUrl: resolveMediaUrl(post.image),
    })),
    [items]
  );

  const categories = useMemo(() => {
    const unique = new Map();
    blogPosts.forEach((post) => {
      const label = String(post.category || "").trim();
      const key = normalizeCategory(label);
      if (key && !unique.has(key)) unique.set(key, label);
    });
    return [{ key: "all", label: "All" }, ...Array.from(unique, ([key, label]) => ({ key, label }))];
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === "all" || normalizeCategory(post.category) === activeCategory;
      const matchesSearch = !query || [post.title, post.description, post.category, post.content]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [blogPosts, activeCategory, searchText]);

  const clearFilters = () => {
    setSearchText("");
    setActiveCategory("all");
  };

  return (
    <section className="blogs-section" aria-labelledby="blogs-title">
      <div className="blogs-decoration blogs-decoration-blue" aria-hidden="true" />
      <div className="blogs-decoration blogs-decoration-purple" aria-hidden="true" />
      <div className="blogs-decoration blogs-decoration-yellow" aria-hidden="true" />
      <div className="blogs-decoration blogs-decoration-cyan" aria-hidden="true" />

      <div className="blogs-container">
        <header className="blogs-heading">
          <div className="blogs-eyebrow"><span className="blogs-eyebrow-line" /><span>TECHNOLOGY EDUCATION</span><span className="blogs-eyebrow-line" /></div>
          <h1 id="blogs-title">Explore the blog</h1>
          <p>Simple and practical articles about IoT, robotics, coding, electronics, AI and STEM education for curious minds.</p>
          <img src={blogRobot} alt="" className="blogs-heading-robot" aria-hidden="true" loading="lazy" />
        </header>

        <div className="blogs-toolbar">
          <label className="blogs-search">
            <Search size={23} />
            <input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search articles, topics or keywords..." aria-label="Search blog articles" />
            {searchText && <button type="button" className="blogs-clear-search" onClick={() => setSearchText("")} aria-label="Clear search">×</button>}
          </label>

          {!loading && !error && categories.length > 1 && (
            <div className="blogs-categories" role="group" aria-label="Filter blog categories">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.key}
                  className={`blogs-category ${activeCategory === category.key ? "active" : ""}`}
                  onClick={() => setActiveCategory(category.key)}
                  aria-pressed={activeCategory === category.key}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="blogs-empty"><h2>Loading articles…</h2></div>
        ) : error ? (
          <div className="blogs-empty" role="alert"><h2>Articles are temporarily unavailable</h2><p>{error}</p></div>
        ) : filteredPosts.length > 0 ? (
          <div className="blogs-grid" aria-live="polite">
            {filteredPosts.map((post, index) => (
              <article className="blogs-card" key={post._id || post.id} style={{ "--blogs-card-delay": `${index * 90}ms` }}>
                <Link to={`/blog/${post.id}`} className="blogs-card-image-link" aria-label={`Read ${post.title}`}>
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.alt} className="blogs-card-image" loading={index < 3 ? "eager" : "lazy"} />
                  ) : (
                    <div className="blogs-card-image blogs-image-empty">No image uploaded</div>
                  )}
                </Link>
                <div className="blogs-card-content">
                  <div className="blogs-card-meta">
                    {post.category && <span className={`blogs-tag blogs-tag-${normalizeCategory(post.category).replace(/\s+/g, "-")}`}>{post.category}</span>}
                    {post.date && <time>{post.date}</time>}
                  </div>
                  <h2><Link to={`/blog/${post.id}`}>{post.title}</Link></h2>
                  <p>{post.description}</p>
                  <Link to={`/blog/${post.id}`} className="blogs-read-more" aria-label={`Read more about ${post.title}`}>Read More <ArrowRight size={19} /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="blogs-empty" aria-live="polite">
            <Search size={34} />
            <h2>{blogPosts.length ? "No articles found" : "No published articles yet"}</h2>
            <p>{blogPosts.length ? "Try another keyword or select a different category." : "Published blogs added in the admin dashboard will appear here."}</p>
            <button type="button" onClick={clearFilters}>Show all articles</button>
          </div>
        )}
      </div>
    </section>
  );
}
