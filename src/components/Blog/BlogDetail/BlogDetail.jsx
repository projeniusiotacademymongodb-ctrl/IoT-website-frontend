
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Copy,
  Linkedin,
  BookOpen,
  Check,
  Lightbulb,
  Rocket,
  Sparkles,
  Code2,
} from "lucide-react";

import { usePublicContent } from "../../../hooks/usePublicContent.js";
import "./BlogDetail.css";

const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).trim().replace(/\/+$/, "");

function resolveMediaUrl(value) {
  const url = String(value || "").trim();

  if (!url) return "";

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  try {
    const origin = new URL(API_BASE_URL).origin;
    return new URL(url.replace(/^\/+/, ""), `${origin}/`).href;
  } catch {
    return url;
  }
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getReadingTime(content) {
  const words = String(content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

/*
  Supported admin article content:

  ## Section heading
  ### Subheading

  1. Project title
  Description of the project.

  - Bullet point one
  - Bullet point two

  ![Image description](/uploads/article-image.webp)

  Content is rendered as React elements, not raw HTML.
*/
function parseArticleContent(content) {
  const blocks = String(content || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const result = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    // Markdown image
    const imageMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (imageMatch) {
      result.push({
        type: "image",
        alt: imageMatch[1] || "ProJenius article image",
        src: imageMatch[2].trim(),
        key: index,
      });
      continue;
    }

    // Markdown heading
    const headingMatch = block.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      result.push({
        type: headingMatch[1].length === 1 ? "h2" : "h3",
        text: headingMatch[2],
        key: index,
      });
      continue;
    }

    // Numbered project heading with its following description
    const projectMatch = block.match(/^(\d+)[.)]\s+(.+?)(?:\n([\s\S]+))?$/);

    if (projectMatch) {
      let description = projectMatch[3] || "";

      const nextBlock = blocks[index + 1];

      if (
        !description &&
        nextBlock &&
        !/^(#{1,3}\s+|!\[|\d+[.)]\s+|[-*•]\s+)/.test(nextBlock)
      ) {
        description = nextBlock;
        index += 1;
      }

      result.push({
        type: "project",
        number: projectMatch[1].padStart(2, "0"),
        title: projectMatch[2].trim(),
        description,
        key: index,
      });

      continue;
    }

    // Bullet / ordered list
    const lines = block.split("\n").map((line) => line.trim());

    const isList = lines.every((line) =>
      /^([-*•]|\d+[.)])\s+/.test(line)
    );

    if (isList) {
      result.push({
        type: "list",
        items: lines.map((line) =>
          line.replace(/^([-*•]|\d+[.)])\s+/, "")
        ),
        key: index,
      });

      continue;
    }

    // Treat short standalone lines as section headings.
    if (
      !block.includes("\n") &&
      block.length <= 65 &&
      !/[.!?]$/.test(block)
    ) {
      result.push({
        type: "h2",
        text: block,
        key: index,
      });
      continue;
    }

    result.push({
      type: "paragraph",
      text: block,
      key: index,
    });
  }

  return result;
}

function ArticleBlock({ block, index }) {
  if (block.type === "h2") {
    return (
      <h2 className="blog-content-heading" key={block.key}>
        <span className="blog-heading-marker" />
        {block.text}
      </h2>
    );
  }

  if (block.type === "h3") {
    return (
      <h3 className="blog-content-subheading" key={block.key}>
        {block.text}
      </h3>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="blog-content-image" key={block.key}>
        <img
          src={resolveMediaUrl(block.src)}
          alt={block.alt}
          loading="lazy"
          decoding="async"
        />
        {block.alt && <figcaption>{block.alt}</figcaption>}
      </figure>
    );
  }

  if (block.type === "project") {
    return (
      <article
        className="blog-project-card"
        key={block.key}
      >
        <div className="blog-project-card-top">
          <span className="blog-project-number">{block.number}</span>
          <span className="blog-project-icon">
            {index % 3 === 0 ? (
              <Rocket size={24} />
            ) : index % 3 === 1 ? (
              <Lightbulb size={24} />
            ) : (
              <Code2 size={24} />
            )}
          </span>
        </div>

        <h3>{block.title}</h3>

        {block.description && <p>{block.description}</p>}

        <span className="blog-project-accent">
          <Sparkles size={15} />
          Practical learning
        </span>
      </article>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="blog-content-list" key={block.key}>
        {block.items.map((item, itemIndex) => (
          <li key={`${block.key}-${itemIndex}`}>
            <span className="blog-list-check">
              <Check size={16} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="blog-content-paragraph" key={block.key}>
      {block.text}
    </p>
  );
}

export default function BlogDetail() {
  const { id } = useParams();

  const {
    items = [],
    loading,
    error,
  } = usePublicContent("blogs");

  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const article = useMemo(() => {
    if (!Array.isArray(items)) return null;

    return items.find(
      (item) =>
        String(item.slug || "") === String(id) ||
        String(item._id || "") === String(id)
    );
  }, [items, id]);

  const contentBlocks = useMemo(
    () => parseArticleContent(article?.content),
    [article?.content]
  );

  const title = article?.title || "ProJenius Insights";
  const excerpt = article?.excerpt || "";

  // Use the Admin-uploaded cover image.
  const coverImage = resolveMediaUrl(
    article?.image ||
      article?.coverImage ||
      article?.featuredImage ||
      article?.thumbnail
  );

  const date = formatDate(
    article?.publishedAt || article?.createdAt
  );

  const readingTime = getReadingTime(article?.content);
  const category = String(article?.category || "").trim();

  useEffect(() => {
    setImageFailed(false);
    setCopied(false);
  }, [id, coverImage]);

  if (loading) {
    return (
      <main className="blog-detail-loading">
        <div className="blog-loading-icon">
          <BookOpen size={34} />
        </div>
        <h1>Loading ProJenius article...</h1>
        <p>Preparing your reading experience.</p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="blog-detail-loading">
        <div className="blog-loading-icon">
          <BookOpen size={38} />
        </div>
        <span>PROJENIUS INSIGHTS</span>
        <h1>Article not available</h1>
        <p>
          This article may have been unpublished, removed,
          or its URL may have changed.
        </p>
        <Link to="/blog" className="blog-primary-link">
          <ArrowLeft size={17} />
          Back to Blog
        </Link>
      </main>
    );
  }

  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const shareUrl = encodeURIComponent(pageUrl);
  const shareTitle = encodeURIComponent(title);

  async function copyArticleLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="blog-detail-page">
      {/* HERO */}
      <section className="blog-detail-hero">
        <div className="blog-detail-hero-bg" aria-hidden="true" />

        <div className="blog-detail-hero-inner">
          <div className="blog-detail-hero-copy">
            <Link to="/blog" className="blog-detail-back-top">
              <ArrowLeft size={17} />
              Back to Blog
            </Link>

            <span className="blog-detail-brand-label">
              PROJENIUS · IDEAS INTO INNOVATION
            </span>

            {category && (
              <span className="blog-detail-category">
                <Sparkles size={14} />
                {category}
              </span>
            )}

            <h1>{title}</h1>

            {excerpt && (
              <p className="blog-detail-hero-excerpt">
                {excerpt}
              </p>
            )}

            <div className="blog-detail-hero-stats">
              {date && (
                <span>
                  <CalendarDays size={17} />
                  {date}
                </span>
              )}

              <span>
                <Clock3 size={17} />
                {readingTime} min read
              </span>
            </div>
          </div>

          <div className="blog-detail-hero-visual">
            {coverImage && !imageFailed ? (
              <img
                src={coverImage}
                alt={title}
                className="blog-detail-cover-image"
                fetchPriority="high"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="blog-detail-image-placeholder">
                <div className="blog-placeholder-icon">
                  <Rocket size={58} />
                </div>
                <strong>Ideas into Innovation</strong>
                <span>
                  Upload the article cover image from ProJenius Admin
                </span>
              </div>
            )}

            <div className="blog-visual-tag">
              <Sparkles size={16} />
              Learn · Build · Deliver
            </div>
          </div>
        </div>
      </section>

      {/* AUTHOR / SHARE */}
      <section className="blog-detail-meta-wrap">
        <div className="blog-detail-meta">
          <div className="blog-detail-author">
            <span className="blog-detail-author-avatar">P</span>
            <span>
              <strong>ProJenius</strong>
              <small>Innovate · Build · Deliver</small>
            </span>
          </div>

          <span className="blog-detail-meta-item">
            <BookOpen size={17} />
            {readingTime} min read
          </span>

          <div className="blog-detail-share">
            <span>Share article</span>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              className="blog-share-facebook"
            >
              f
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              className="blog-share-x"
            >
              𝕏
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="blog-share-linkedin"
            >
              <Linkedin size={17} />
            </a>

            <button
              type="button"
              onClick={copyArticleLink}
              aria-label="Copy article link"
              className="blog-share-copy"
              title={copied ? "Copied" : "Copy link"}
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
            </button>
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <div className="blog-detail-layout">
        <article className="blog-detail-article">
          {excerpt && (
            <section className="blog-detail-intro">
              <span className="blog-section-kicker">
                <span />
                ARTICLE OVERVIEW
                <span />
              </span>

              <h2>{title}</h2>
              <p>{excerpt}</p>
            </section>
          )}

          <div className="blog-detail-body">
            {contentBlocks.length > 0 ? (
              contentBlocks.map((block, index) => (
                <ArticleBlock
                  key={block.key}
                  block={block}
                  index={index}
                />
              ))
            ) : (
              <div className="blog-detail-empty-content">
                <BookOpen size={32} />
                <h3>Article content is being prepared</h3>
                <p>
                  Please add the article content from the ProJenius Admin
                  dashboard.
                </p>
              </div>
            )}
          </div>

          {/* BRAND CTA */}
          <section className="blog-detail-footer">
            <div className="blog-footer-visual">
              <div className="blog-footer-orbit orbit-one" />
              <div className="blog-footer-orbit orbit-two" />
              <Rocket size={48} />
              <Sparkles className="blog-footer-sparkle" size={24} />
            </div>

            <div className="blog-detail-footer-copy">
              <span>PROJENIUS · KEEP EXPLORING</span>

              <h2>
                Think bigger.
                <strong> Build what’s next.</strong>
              </h2>

              <p>
                Explore more technology insights, practical projects
                and innovation stories from ProJenius.
              </p>

              <Link to="/blog">
                Explore More Articles
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>

          <Link to="/blog" className="blog-detail-back">
            <ArrowLeft size={17} />
            Back to all articles
          </Link>
        </article>
      </div>
    </main>
  );
}
