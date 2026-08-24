-- ============================================================
-- OVEJITE - MIGRATE EXISTING CONTENT INTO CMS
-- ============================================================

-- IMPORTANT:
-- This migration only inserts records when the same slug
-- does not already exist.
-- Existing CMS records are NOT overwritten.

-- ============================================================
-- SERVICES
-- ============================================================

INSERT INTO public.cms_records (entity, data)
SELECT
  'Service',
  jsonb_build_object(
    'title', v.title,
    'slug', v.slug,
    'short_description', v.short_description,
    'icon', v.icon,
    'display_order', v.display_order,
    'published', true
  )
FROM (
  VALUES
    (
      'Google Ads Management',
      'google-ads-management',
      'Build and optimize Google Ads campaigns focused on measurable business growth.',
      'Search',
      1
    ),
    (
      'Meta Ads',
      'meta-ads',
      'Reach the right audiences through strategic Meta advertising and creative testing.',
      'Share2',
      2
    ),
    (
      'E-commerce Growth',
      'ecommerce-growth',
      'Grow online stores with Shopping, Performance Max, product feeds, and ROAS optimization.',
      'ShoppingCart',
      3
    ),
    (
      'Conversion Tracking',
      'conversion-tracking',
      'Accurate conversion tracking so you know exactly what is generating results.',
      'Target',
      4
    ),
    (
      'GA4 & GTM Setup',
      'ga4-gtm-setup',
      'Set up reliable analytics and tracking systems using GA4 and Google Tag Manager.',
      'BarChart3',
      5
    ),
    (
      'Server-Side Tracking',
      'server-side-tracking',
      'Improve measurement reliability with modern server-side tracking infrastructure.',
      'Server',
      6
    ),
    (
      'Landing Page Optimization',
      'landing-page-optimization',
      'Improve the user journey and increase the chances of conversion.',
      'Layout',
      7
    ),
    (
      'Growth Strategy',
      'growth-strategy',
      'Connect advertising, data, conversion optimization, and business goals.',
      'TrendingUp',
      8
    )
) AS v(title, slug, short_description, icon, display_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.cms_records c
  WHERE c.entity = 'Service'
    AND c.data->>'slug' = v.slug
);


-- ============================================================
-- INDUSTRIES
-- ============================================================

INSERT INTO public.cms_records (entity, data)
SELECT
  'Industry',
  jsonb_build_object(
    'title', v.title,
    'slug', v.slug,
    'description', v.description,
    'icon', v.icon,
    'display_order', v.display_order,
    'published', true
  )
FROM (
  VALUES
    (
      'Dental',
      'dental',
      'Lead generation, appointment tracking, search campaigns, and local targeting.',
      'Stethoscope',
      1
    ),
    (
      'Medical',
      'medical',
      'Qualified leads, compliance-aware advertising, conversion tracking, and patient acquisition.',
      'HeartPulse',
      2
    ),
    (
      'Local Services',
      'local-services',
      'Calls, form leads, local search advertising, and service-area targeting.',
      'MapPin',
      3
    ),
    (
      'E-commerce',
      'ecommerce',
      'Shopping campaigns, Performance Max, product feeds, ROAS, and customer acquisition.',
      'ShoppingBag',
      4
    )
) AS v(title, slug, description, icon, display_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.cms_records c
  WHERE c.entity = 'Industry'
    AND c.data->>'slug' = v.slug
);


-- ============================================================
-- CASE STUDIES
-- ============================================================

INSERT INTO public.cms_records (entity, data)
SELECT
  'CaseStudy',
  jsonb_build_object(
    'title', v.title,
    'slug', v.slug,
    'industry', v.industry,
    'excerpt', v.excerpt,
    'featured', true,
    'published', true
  )
FROM (
  VALUES
    (
      'Case Study Coming Soon',
      'coming-soon-dental',
      'dental',
      'Project details available soon. Real strategy, metrics, and results will be published here.'
    ),
    (
      'Case Study Coming Soon',
      'coming-soon-medical',
      'medical',
      'Project details available soon. Real strategy, metrics, and results will be published here.'
    ),
    (
      'Case Study Coming Soon',
      'coming-soon-ecommerce',
      'ecommerce',
      'Project details available soon. Real strategy, metrics, and results will be published here.'
    )
) AS v(title, slug, industry, excerpt)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.cms_records c
  WHERE c.entity = 'CaseStudy'
    AND c.data->>'slug' = v.slug
);


-- ============================================================
-- RESOURCES
-- ============================================================

INSERT INTO public.cms_records (entity, data)
SELECT
  'Resource',
  jsonb_build_object(
    'title', v.title,
    'slug', v.slug,
    'category', v.category,
    'excerpt', v.excerpt,
    'featured', true,
    'published', true,
    'publish_date', now()
  )
FROM (
  VALUES
    (
      'Understanding GA4: A Beginner''s Guide',
      'understanding-ga4',
      'ga4_gtm',
      'Learn the fundamentals of Google Analytics 4 and how to set it up for accurate measurement.'
    ),
    (
      '5 Google Ads Mistakes Killing Your ROAS',
      'google-ads-mistakes',
      'google_ads',
      'Common pitfalls in Google Ads campaigns and how to fix them for better returns.'
    ),
    (
      'Server-Side Tracking: Why It Matters Now',
      'server-side-tracking-guide',
      'conversion_tracking',
      'How server-side tracking improves data reliability in a privacy-first world.'
    )
) AS v(title, slug, category, excerpt)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.cms_records c
  WHERE c.entity = 'Resource'
    AND c.data->>'slug' = v.slug
);
