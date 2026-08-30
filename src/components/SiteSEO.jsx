import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageSEO } from "@/hooks/usePageSEO";

const SITE_URL = "https://www.ovejite.me";

const PAGE_SEO = {
  "/": {
    title: null,
    description: null,
  },

  "/about": {
    title: "About Ovejite | Performance Marketing Specialist",
    description:
      "Learn about Ovejite, a performance marketing specialist focused on Google Ads, Meta Ads, conversion tracking, GA4, GTM, CRO, and measurable business growth.",
  },

  "/services": {
    title: "Digital Marketing Services | Ovejite",
    description:
      "Explore performance marketing services including Google Ads management, Meta Ads, conversion tracking, GA4, GTM, server-side tracking, CRO, and growth strategy.",
  },

  "/industries": {
    title: "Industries We Help Grow | Ovejite",
    description:
      "Performance marketing strategies for ecommerce, local businesses, healthcare, dental practices, and businesses looking to grow with data-driven advertising.",
  },

  "/case-studies": {
    title: "Marketing Case Studies & Results | Ovejite",
    description:
      "Explore real performance marketing case studies, campaign improvements, conversion tracking solutions, Google Ads strategies, and business growth results.",
  },

  "/resources": {
    title: "Digital Marketing Resources | Ovejite",
    description:
      "Explore practical resources about Google Ads, conversion tracking, GA4, GTM, paid advertising, performance marketing, and business growth.",
  },

  "/contact": {
    title: "Contact Ovejite | Let's Grow Your Business",
    description:
      "Get in touch with Ovejite to discuss Google Ads, paid advertising, conversion tracking, analytics, CRO, and performance marketing strategy.",
  },

  "/privacy": {
    title: "Privacy Policy | Ovejite",
    description:
      "Read the privacy policy for Ovejite and learn how website information and data are handled.",
  },

  "/terms": {
    title: "Terms & Conditions | Ovejite",
    description:
      "Read the terms and conditions for using the Ovejite website and services.",
  },
};

function slugToTitle(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => {
      if (word.toLowerCase() === "ga4") return "GA4";
      if (word.toLowerCase() === "gtm") return "GTM";
      if (word.toLowerCase() === "cro") return "CRO";

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getSEOForPath(pathname, settings) {
  // HOME
  if (pathname === "/") {
    return {
      title:
        settings.seo_title ||
        "Ovejite | Google Ads & Performance Marketing Specialist",

      description:
        settings.meta_description ||
        "Google Ads and performance marketing specialist helping businesses grow through paid advertising, conversion tracking, GA4, GTM, and CRO.",
    };
  }

  // SERVICE DETAILS
  if (pathname.startsWith("/services/")) {
    const slug = pathname.replace("/services/", "");
    const serviceName = slugToTitle(slug);

    return {
      title: `${serviceName} Services | Ovejite`,
      description: `Professional ${serviceName} services focused on measurable growth, accurate tracking, better campaign performance, and improved business results.`,
    };
  }

  // INDUSTRY DETAILS
  if (pathname.startsWith("/industries/")) {
    const slug = pathname.replace("/industries/", "");
    const industryName = slugToTitle(slug);

    return {
      title: `${industryName} Digital Marketing | Ovejite`,
      description: `Performance marketing strategies for ${industryName} businesses using paid advertising, conversion tracking, analytics, and growth optimization.`,
    };
  }

  // CASE STUDY DETAILS
  if (pathname.startsWith("/case-studies/")) {
    const slug = pathname.replace("/case-studies/", "");
    const caseStudyName = slugToTitle(slug);

    return {
      title: `${caseStudyName} Case Study | Ovejite`,
      description: `Explore this performance marketing case study and discover the strategy, tracking improvements, campaign optimization, and results achieved.`,
    };
  }

  // RESOURCE DETAILS
  if (pathname.startsWith("/resources/")) {
    const slug = pathname.replace("/resources/", "");
    const resourceName = slugToTitle(slug);

    return {
      title: `${resourceName} | Ovejite Resources`,
      description: `Learn more about ${resourceName} with practical performance marketing insights, strategies, tracking guidance, and growth recommendations.`,
    };
  }

  return (
    PAGE_SEO[pathname] || {
      title: "Ovejite | Performance Marketing Specialist",
      description:
        "Google Ads and performance marketing specialist helping businesses grow through smarter advertising, accurate tracking, analytics, and continuous optimization.",
    }
  );
}

export default function SiteSEO() {
  const location = useLocation();

  const { settings } = useSiteSettings();

  const seo = getSEOForPath(location.pathname, settings);

  const canonical = `${SITE_URL}${location.pathname}`.replace(/\/$/, "") || SITE_URL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.title,
    description: seo.description,
    url: canonical,
    isPartOf: {
      "@type": "WebSite",
      name: settings.name || "Ovejite",
      url: SITE_URL,
    },
  };

  usePageSEO({
    title: seo.title,
    description: seo.description,
    image: settings.og_image,
    favicon: settings.favicon || "/favicon.svg",
    canonical,
    type: "website",
    siteName: settings.name || "Ovejite",
    jsonLd,
  });

  return null;
}
