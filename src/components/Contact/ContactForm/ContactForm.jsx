
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import "./ContactForm.css";
import { openTrackedWhatsApp, trackedWhatsAppUrl, trackWhatsAppClick } from "../../../utils/whatsapp.js";

const WHATSAPP_NUMBER = "918925450473";
const COUNTRY_CODE = "+91";

// Replace this with your actual company website URL if needed.
const COMPANY_WEBSITE = "/";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Madurai%2C+Tamil+Nadu+625003";

const initialForm = {
  parentName: "",
  childName: "",
  childAge: "",
  phone: "",
  email: "",
  course: "",
  message: "",
};

const contactDetails = [
  {
    label: "Phone",
    value: "+91 89254 50473",
    icon: Phone,
    tone: "phone",
    href: "tel:+918925450473",
  },
  {
    label: "Email",
    value: "teamprojenius@gmail.com",
    icon: Mail,
    tone: "email",
    href: "mailto:teamprojenius@gmail.com",
  },
  {
    label: "Location",
    value: "Madurai, Tamil Nadu 625003",
    icon: MapPin,
    tone: "location",
    href: GOOGLE_MAPS_URL,
    external: true,
  },
  {
    label: "Working Hours",
    value: "Mon - Sat, 10:00 AM - 7:00 PM",
    icon: Clock,
    tone: "hours",
    href: COMPANY_WEBSITE,
  },
];

const courses = [
  "IoT",
  "Robotics",
  "Arduino",
  "Electronics",
  "Coding",
  "Artificial Intelligence",
  "General",
];

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    // Accept exactly 10 digits for an Indian mobile number.
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    // Child age: numeric input, maximum two digits.
    if (name === "childAge") {
      value = value.replace(/\D/g, "").slice(0, 2);
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(form.phone)) {
      window.alert(
        "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
      );
      return;
    }

    const age = Number(form.childAge);

    if (!Number.isInteger(age) || age < 1 || age > 18) {
      window.alert("Please enter a child age between 1 and 18.");
      return;
    }

    try {
      const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_BASE_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "Contact page form", parentName: form.parentName.trim(), childName: form.childName.trim(), childAge: age, email: form.email.trim(), message: form.message.trim() }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not submit your enquiry. Please try again.");
      window.alert("Your enquiry was submitted successfully. Our team will contact you soon.");
    } catch (error) {
      window.alert(`${error.message || "Unable to reach the server."} You can still contact us through WhatsApp.`);
    }

    const message = [
      "Hello TechSprout Kids! I would like to enquire about your courses.",
      "",
      "ENQUIRY DETAILS",
      "------------------------------",
      `Parent Name: ${form.parentName.trim()}`,
      `Child Name: ${form.childName.trim()}`,
      `Child Age: ${age}`,
      `Phone Number: ${COUNTRY_CODE} ${form.phone}`,
      `Email: ${form.email.trim()}`,
      `Interested Course: ${form.course}`,
      `Message: ${form.message.trim() || "No additional message"}`,
      "------------------------------",
    ].join("\n");

    // Track which section started the WhatsApp conversation. This records a click;
    // actual incoming WhatsApp messages require a WhatsApp Business webhook.
    openTrackedWhatsApp({
      number: WHATSAPP_NUMBER,
      source: "Contact page form",
      item: form.course,
      message,
    });
  };

  return (
    <section
      className="contact-form-section"
      aria-labelledby="contact-form-title"
    >
      <div className="contact-form-panel">
        {/* Background decorations */}
        <div
          className="contact-form-decoration contact-form-decoration-one"
          aria-hidden="true"
        />

        <div
          className="contact-form-decoration contact-form-decoration-two"
          aria-hidden="true"
        />

        {/* Left-side contact information */}
        <div className="contact-form-info">
          <div className="contact-form-eyebrow">
            <span>GET IN TOUCH</span>
            <span
              className="contact-form-eyebrow-line"
              aria-hidden="true"
            />
          </div>

          <h2 id="contact-form-title">
            Let’s find the
            <span>right learning</span>
            <span>path.</span>
          </h2>

          <p className="contact-form-intro">
            Share a few details about your child and the course you are
            interested in. We’ll get back to you as soon as possible.
          </p>

          {/* Clickable contact details */}
          <div className="contact-form-details">
            {contactDetails.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  className="contact-detail contact-detail-link"
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={
                    item.external
                      ? "noopener noreferrer"
                      : undefined
                  }
                  aria-label={`${item.label}: ${item.value}`}
                >
                  <span className={`contact-detail-icon ${item.tone}`}>
                    <Icon
                      size={21}
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  </span>

                  <span className="contact-detail-copy">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </span>
                </a>
              );
            })}
          </div>

          {/* WhatsApp contact button */}
          <a
            className="contact-whatsapp-button"
            href={trackedWhatsAppUrl({ number: WHATSAPP_NUMBER, source: "Contact page WhatsApp button", message: "Hello TechSprout Kids! I would like to enquire about your programs." })}
            onClick={() => trackWhatsAppClick({ source: "Contact page WhatsApp button" })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={22} aria-hidden="true" />
            <span>Chat on WhatsApp</span>
            <ArrowRight size={21} aria-hidden="true" />
          </a>
        </div>

        {/* Optional decorative illustration */}
        <div
          className="contact-form-illustration"
          aria-hidden="true"
        >
          <img
            src="/images/contact-form.png"
            alt=""
            loading="lazy"
          />
        </div>

        {/* Enquiry form */}
        <div className="contact-form-card">
          <form onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              {/* Parent name */}
              <div className="contact-field">
                <label htmlFor="parentName">Parent Name</label>
                <input
                  id="parentName"
                  name="parentName"
                  type="text"
                  value={form.parentName}
                  onChange={handleChange}
                  placeholder="Enter parent name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>

              {/* Child name */}
              <div className="contact-field">
                <label htmlFor="childName">Child Name</label>
                <input
                  id="childName"
                  name="childName"
                  type="text"
                  value={form.childName}
                  onChange={handleChange}
                  placeholder="Enter child name"
                  maxLength={100}
                  required
                />
              </div>

              {/* Child age */}
              <div className="contact-field">
                <label htmlFor="childAge">Child Age</label>
                <input
                  id="childAge"
                  name="childAge"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="18"
                  step="1"
                  value={form.childAge}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  required
                />
              </div>

              {/* Indian mobile number */}
              <div className="contact-field">
                <label htmlFor="phone">Phone Number</label>

                <div className="contact-phone-input">
                  <span className="contact-country-code">
                    {COUNTRY_CODE}
                  </span>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
                    aria-describedby="phone-help"
                    required
                  />
                </div>

                <small id="phone-help">
                  Enter 10 digits without the country code.
                </small>
              </div>

              {/* Email */}
              <div className="contact-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </div>

              {/* Course selection */}
              <div className="contact-field">
                <label htmlFor="course">Interested Course</label>

                <select
                  id="course"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select a course
                  </option>

                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional message */}
              <div className="contact-field contact-field-full">
                <label htmlFor="message">Message</label>

                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you would like to know"
                  rows={4}
                  maxLength={2000}
                />
              </div>
            </div>

            {/* Submit enquiry to WhatsApp */}
            <button
              className="contact-submit-button"
              type="submit"
            >
              <span>Send Enquiry</span>
              <ArrowRight size={22} strokeWidth={2.4} aria-hidden="true" />
            </button>

            <p className="contact-form-note">
              Your enquiry details will be prepared as a WhatsApp message.
              Review the message and press Send in WhatsApp to submit it.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
