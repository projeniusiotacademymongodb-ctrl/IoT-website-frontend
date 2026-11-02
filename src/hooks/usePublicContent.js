/**
 * File: website-frontend/src/hooks/usePublicContent.js
 *
 * Purpose:
 * Fetch published website content from the public backend API.
 *
 * Supported resources:
 * - courses
 * - blogs
 * - pricing
 * - projects
 * - reviews
 * - testimonials
 *
 * Features:
 * - API URL normalization
 * - Loading and error states
 * - AbortController cleanup
 * - Response validation
 * - Supports array and paginated API responses
 * - No dummy or hardcoded API data
 */

import { useEffect, useState } from "react";

// ======================================================
// API CONFIGURATION
// ======================================================

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

function getApiBaseUrl() {
  const configuredUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();

  // Local development may use the local website API. Production must be
  // explicitly configured with the deployed website-backend URL.
  if (!configuredUrl) {
    return import.meta.env.DEV ? DEFAULT_API_BASE_URL : "";
  }

  // A single API URL must be configured.
  if (configuredUrl.includes(",")) {
    throw new Error(
      "Invalid VITE_API_BASE_URL. Configure only one API URL."
    );
  }

  const normalizedUrl = configuredUrl.replace(/\/+$/, "");

  // Support both:
  // http://localhost:5000
  // http://localhost:5000/api

  return /\/api$/i.test(normalizedUrl)
    ? normalizedUrl
    : `${normalizedUrl}/api`;
}

const API_BASE_URL = getApiBaseUrl();


// ======================================================
// RESPONSE NORMALIZATION
// ======================================================

function extractRecords(data) {
  // Backend returns a direct array.
  if (Array.isArray(data)) {
    return data;
  }

  // Backend returns { items: [...] }.
  if (Array.isArray(data?.items)) {
    return data.items;
  }

  // Support { data: [...] }.
  if (Array.isArray(data?.data)) {
    return data.data;
  }

  // Support { results: [...] }.
  if (Array.isArray(data?.results)) {
    return data.results;
  }

  // Support { data: { items: [...] } }.
  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  throw new Error(
    "Invalid API response. Expected a list of records."
  );
}


// ======================================================
// PUBLIC CONTENT HOOK
// ======================================================

export function usePublicContent(resource) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadContent() {
      setLoading(true);
      setError("");

      try {
        const resourceName = String(resource || "")
          .trim()
          .replace(/^\/+|\/+$/g, "");

        if (!resourceName) {
          throw new Error(
            "A valid API resource name is required."
          );
        }

        if (!API_BASE_URL) {
          throw new Error(
            "Website API is not configured. Set VITE_API_BASE_URL to your deployed website-backend URL ending in /api, then redeploy the frontend."
          );
        }

        const endpoint =
          `${API_BASE_URL}/${encodeURIComponent(resourceName)}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        // ----------------------------------------------
        // HANDLE HTTP ERRORS
        // ----------------------------------------------

        const responseText = await response.text();

        let responseData = null;

        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = null;
          }
        }

        if (!response.ok) {
          throw new Error(
            responseData?.message ||
              `Unable to load ${resourceName}. HTTP ${response.status}.`
          );
        }

        // ----------------------------------------------
        // VALIDATE RESPONSE DATA
        // ----------------------------------------------

        if (!responseData && responseText) {
          throw new Error(
            `${resourceName} API returned an invalid JSON response.`
          );
        }

        const records = extractRecords(responseData);

        // ----------------------------------------------
        // UPDATE STATE
        // ----------------------------------------------

        if (!controller.signal.aborted) {
          setItems(records);
          setError("");
        }

      } catch (fetchError) {
        if (
          fetchError.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          console.error(
            `Public ${resource} API error:`,
            fetchError
          );

          setItems([]);

          setError(
            fetchError.message ||
              `Unable to load ${resource}.`
          );
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      controller.abort();
    };

  }, [resource]);


  // `courses` and `data` aliases maintain compatibility
  // with existing components that use those property names.

  return {
    items,
    courses: items,
    data: items,
    loading,
    error,
  };
}