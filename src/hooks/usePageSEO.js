import { useEffect } from "react";

const SITE_NAME = "Ovejite";
const SITE_URL = "https://www.ovejite.me";

function getOrCreateMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    document.head.appendChild(element);
  }

  return element;
}

function getOrCreateLink(rel) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  return element;
}

export function usePageSEO({
  title,
  description,
  image,
  canonical,
  type = "website",
  robots = "index, follow",
  siteName = SITE_NAME,
  favicon,
  jsonLd,
  seo_title,
  meta_description,
  og_image,
} = {}) {
  title = seo_title || title;
  description = meta_description || description;
  image = og_image || image;

  useEffect(() => {
    const pageTitle =
      title || "Ovejite | Google Ads & Performance Marketing Specialist";

    const pageDescription =
      description ||
      "Google Ads and performance marketing specialist helping businesses grow through paid advertising, conversion tracking, GA4, GTM, and CRO.";

    const pageCanonical =
      canonical ||
      `${SITE_URL}${window.location.pathname}`.replace(/\/$/, "") ||
      SITE_URL;

    // PAGE TITLE
    document.title = pageTitle;

    // META DESCRIPTION
    const descriptionMeta = getOrCreateMeta(
      'meta[name="description"]',
      { name: "description" }
    );

    descriptionMeta.setAttribute("content", pageDescription);

    // ROBOTS
    const robotsMeta = getOrCreateMeta(
      'meta[name="robots"]',
      { name: "robots" }
    );

    robotsMeta.setAttribute("content", robots);

    // CANONICAL
    const canonicalLink = getOrCreateLink("canonical");

    canonicalLink.setAttribute(
      "href",
      pageCanonical.startsWith("http")
        ? pageCanonical
        : `${SITE_URL}${pageCanonical}`
    );

    // OPEN GRAPH TITLE
    const ogTitle = getOrCreateMeta(
      'meta[property="og:title"]',
      { property: "og:title" }
    );

    ogTitle.setAttribute("content", pageTitle);

    // OPEN GRAPH DESCRIPTION
    const ogDescription = getOrCreateMeta(
      'meta[property="og:description"]',
      { property: "og:description" }
    );

    ogDescription.setAttribute("content", pageDescription);

    // OPEN GRAPH TYPE
    const ogType = getOrCreateMeta(
      'meta[property="og:type"]',
      { property: "og:type" }
    );

    ogType.setAttribute("content", type);

    // OPEN GRAPH URL
    const ogUrl = getOrCreateMeta(
      'meta[property="og:url"]',
      { property: "og:url" }
    );

    ogUrl.setAttribute(
      "content",
      pageCanonical.startsWith("http")
        ? pageCanonical
        : `${SITE_URL}${pageCanonical}`
    );

    // OPEN GRAPH SITE NAME
    const ogSiteName = getOrCreateMeta(
      'meta[property="og:site_name"]',
      { property: "og:site_name" }
    );

    ogSiteName.setAttribute("content", siteName);

    // OPEN GRAPH IMAGE
    if (image) {
      const ogImage = getOrCreateMeta(
        'meta[property="og:image"]',
        { property: "og:image" }
      );

      ogImage.setAttribute("content", image);

      const ogImageAlt = getOrCreateMeta(
        'meta[property="og:image:alt"]',
        { property: "og:image:alt" }
      );

      ogImageAlt.setAttribute(
        "content",
        `${siteName} - Performance Marketing`
      );
    }

    // TWITTER CARD
    const twitterCard = getOrCreateMeta(
      'meta[name="twitter:card"]',
      { name: "twitter:card" }
    );

    twitterCard.setAttribute(
      "content",
      image ? "summary_large_image" : "summary"
    );

    // TWITTER TITLE
    const twitterTitle = getOrCreateMeta(
      'meta[name="twitter:title"]',
      { name: "twitter:title" }
    );

    twitterTitle.setAttribute("content", pageTitle);

    // TWITTER DESCRIPTION
    const twitterDescription = getOrCreateMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" }
    );

    twitterDescription.setAttribute("content", pageDescription);

    // TWITTER IMAGE
    if (image) {
      const twitterImage = getOrCreateMeta(
        'meta[name="twitter:image"]',
        { name: "twitter:image" }
      );

      twitterImage.setAttribute("content", image);
    }

    // FAVICON
    if (favicon) {
      const iconLink =
        document.head.querySelector('link[rel="icon"]') ||
        document.createElement("link");

      iconLink.setAttribute("rel", "icon");
      iconLink.setAttribute("href", favicon);

      if (!document.head.contains(iconLink)) {
        document.head.appendChild(iconLink);
      }
    }

    // STRUCTURED DATA
    if (jsonLd) {
      const existingSchema = document.getElementById("dynamic-page-schema");

      if (existingSchema) {
        existingSchema.remove();
      }

      const schemaScript = document.createElement("script");

      schemaScript.id = "dynamic-page-schema";
      schemaScript.type = "application/ld+json";
      schemaScript.text = JSON.stringify(jsonLd);

      document.head.appendChild(schemaScript);
    }
  }, [
    title,
    description,
    image,
    canonical,
    type,
    robots,
    siteName,
    favicon,
    jsonLd,
  ]);
}
