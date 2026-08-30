import { useEffect, useState } from "react";

const FALLBACK = {
  name: "Ovejite",
  title: "Performance Marketing Specialist",

  short_bio:
    "I help businesses grow through smarter advertising, accurate tracking, and continuous optimization.",

  profile_photo: "",

  email: "hello@ovejite.me",

  whatsapp_number: "",

  whatsapp_message:
    "Hi Ovejite, I would like to discuss my marketing strategy.",

  booking_url: "#contact",

  linkedin: "",
  twitter: "",
  instagram: "",
  facebook: "",

  monthly_ad_spend: "$3.6M+",

  projects_count: "50+",

  years_experience: "3+",

  seo_title:
    "Ovejite | Google Ads & Performance Marketing Specialist",

  meta_description:
    "Google Ads and performance marketing specialist helping businesses grow through paid advertising, conversion tracking, GA4, GTM, and CRO.",

  og_image: "",

  favicon: "/favicon.svg",

  gtm_id: "",
  ga4_id: "",
  meta_pixel_id: "",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(FALLBACK);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const { base44 } = await import("@/api/base44Client");

        const list =
          await base44.entities.SiteSetting.list();

        if (
          mounted &&
          Array.isArray(list) &&
          list.length > 0
        ) {
          setSettings({
            ...FALLBACK,
            ...list[0],
          });
        }
      } catch (error) {
        console.warn(
          "Could not load site settings. Using SEO fallback settings.",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    settings,
    loading,
  };
}

export function buildWhatsAppUrl(number, message) {
  const cleaned = (number || "").replace(
    /[^0-9]/g,
    ""
  );

  const msg = encodeURIComponent(message || "");

  return `https://wa.me/${cleaned}${
    msg ? `?text=${msg}` : ""
  }`;
}

export function trackEvent(
  eventName,
  params = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }

  if (window.fbq) {
    window.fbq(
      "trackCustom",
      eventName,
      params
    );
  }

  if (window.gtag) {
    window.gtag(
      "event",
      eventName,
      params
    );
  }
}
