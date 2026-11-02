import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  GraduationCap,
  Settings,
  ShoppingCart,
  Wifi,
  Wrench,
} from "lucide-react";
import { wphone } from "../../../config/site.js";
import arduinoImg from "../../../assets/Products/kit-arduino.webp";
import iotImg from "../../../assets/Products/kit-iot.webp";
import roboticsImg from "../../../assets/Products/kit-robotics.webp";
import advancedImg from "../../../assets/Products/kit-advanced.webp";
import "./ProductCatalog.css";

const products = [
  {
    id: "arduino",
    name: "Arduino Starter Kit",
    category: "Beginner Kits",
    badge: "Beginner Level",
    tone: "blue",
    image: arduinoImg,
    description:
      "Perfect for beginners to start their journey into electronics and coding.",
    features: [
      "Basic Electronics Components",
      "Arduino Board",
      "Sensors & Modules",
      "Hands-on Project Guide",
    ],
    audience: "School Students & Beginners",
    projects: "4+",
  },
  {
    id: "iot",
    name: "IoT Learning Kit",
    category: "IoT Kits",
    badge: "Most Popular",
    tone: "green",
    image: iotImg,
    description:
      "Build real-world IoT projects with smart sensors and wireless connectivity.",
    features: [
      "ESP32 / ESP8266 Board",
      "Sensors (DHT, MQ, Soil, Ultrasonic)",
      "IoT & Cloud Integration",
      "Multiple Real-world Projects",
    ],
    audience: "School & College Students",
    projects: "10+",
    popular: true,
  },
  {
    id: "robotics",
    name: "Robotics Kit",
    category: "Robotics Kits",
    badge: "Robotics Kit",
    tone: "purple",
    image: roboticsImg,
    description:
      "Design, build and program your own robots with hands-on components.",
    features: [
      "Robot Chassis & Motors",
      "Motor Driver & Sensors",
      "Line Follower / Obstacle Avoider",
      "Multiple Robotics Projects",
    ],
    audience: "School & College Students",
    projects: "8+",
  },
  {
    id: "advanced",
    name: "Advanced IoT & AI Kit",
    category: "Advanced Kits",
    badge: "Advanced Kit",
    tone: "orange",
    image: advancedImg,
    description:
      "For college students and innovators to build advanced projects.",
    features: [
      "ESP32 with Advanced Sensors",
      "Camera, GPS, and AI Modules",
      "Cloud, App & Dashboard Integration",
      "Research & Innovation Projects",
    ],
    audience: "College Students & Innovators",
    projects: "15+",
  },
];

const filters = [
  { label: "All Kits", value: "All Kits", icon: ShoppingCart },
  { label: "Beginner Kits", value: "Beginner Kits", icon: GraduationCap },
  { label: "IoT Kits", value: "IoT Kits", icon: Wifi },
  { label: "Robotics Kits", value: "Robotics Kits", icon: Wrench },
  { label: "Advanced Kits", value: "Advanced Kits", icon: Settings },
];

const wa = (name) =>
  `https://wa.me/${wphone}?text=${encodeURIComponent(
    `Hello ProJenius, I would like to know more about the ${name}. Please share pricing and availability.`
  )}`;

export default function ProductCatalog() {
  const [active, setActive] = useState("All Kits");

  const shown = useMemo(
    () =>
      active === "All Kits"
        ? products
        : products.filter((product) => product.category === active),
    [active]
  );

  return (
    <section
      className="product-catalog products-shell"
      id="product-catalog"
      aria-labelledby="catalog-title"
    >
      <div className="products-section-heading" data-animate="fade-up">
        <span className="section-kicker">
          <i aria-hidden="true" />
          <span>Our Products</span>
          <i aria-hidden="true" />
        </span>

        <h2 id="catalog-title">
          Explore Our <em>Kits</em>
        </h2>

        <p>
          Hands-on learning kits for curious minds — from school students to
          college innovators.
          <br className="desktop-break" /> Build real projects. Gain practical
          skills. Turn ideas into solutions.
        </p>
      </div>

      <div
        className="product-filter-row"
        role="group"
        aria-label="Filter product kits"
        data-animate="fade-up"
      >
        {filters.map(({ label, value, icon: Icon }) => (
          <button
            type="button"
            key={value}
            className={`product-filter ${active === value ? "active" : ""}`}
            onClick={() => setActive(value)}
            aria-pressed={active === value}
          >
            <Icon size={19} />
            {label}
          </button>
        ))}
      </div>

      <div
        className={`product-card-grid ${shown.length < 4 ? "filtered-grid" : ""}`}
      >
        {shown.map((product, index) => (
          <article
            key={`${active}-${product.id}`}
            className={`kit-card kit-${product.tone} kit-card-enter`}
            style={{ "--card-index": index }}
          >
            {product.popular && (
              <span className="kit-popular">
                <Flame size={17} />
                Most Popular
              </span>
            )}

            <div className="kit-image-wrap">
              {!product.popular && (
                <span className="kit-level">
                  <span className="kit-level-dot" />
                  {product.badge}
                </span>
              )}

              <img
                src={product.image}
                alt={`${product.name} electronics kit`}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="kit-card-body">
              <h3>{product.name}</h3>
              <p className="kit-description">{product.description}</p>

              <ul className="kit-features">
                {product.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="kit-meta">
                <div>
                  <UsersIcon tone={product.tone} />
                  <span>{product.audience}</span>
                </div>
                <div>
                  <BookOpen size={20} />
                  <span>
                    <strong>{product.projects}</strong>
                    <small>Projects</small>
                  </span>
                </div>
              </div>

              <div className="kit-actions">
                <a
                  className="kit-view-btn"
                  href={wa(product.name)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShoppingCart size={18} /> View Kit
                </a>
                <a
                  className="kit-enquire-btn"
                  href={wa(product.name)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Enquire Now
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="catalog-benefits" data-animate="fade-up">
        <div>
          <span>
            <Wrench size={23} />
          </span>
          <strong>
            High Quality
            <br />
            Components
          </strong>
        </div>
        <div>
          <span>
            <BookOpen size={23} />
          </span>
          <strong>
            Project Guides
            <br />
            Included
          </strong>
        </div>
        <div>
          <span>
            <PackageIcon />
          </span>
          <strong>
            Pan India
            <br />
            Delivery
          </strong>
        </div>
        <div>
          <span>
            <MessageIcon />
          </span>
          <strong>
            Expert
            <br />
            Support
          </strong>
        </div>
      </div>
    </section>
  );
}

function UsersIcon({ tone }) {
  return <GraduationCap className={`meta-${tone}`} size={23} />;
}

function PackageIcon() {
  return <ShoppingCart size={23} />;
}

function MessageIcon() {
  return <ArrowRight size={23} />;
}
