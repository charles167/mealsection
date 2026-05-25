/**
 * Dynamic Sitemap Generator Utility
 *
 * This utility helps generate a dynamic sitemap for your website.
 * You can use this server-side or as part of your build process.
 *
 * Usage:
 * 1. Fetch vendors and products from your API
 * 2. Use generateSitemap() to create XML
 * 3. Save to public/sitemap.xml or serve dynamically
 */

import { SITE_CONFIG } from "./seo";

/**
 * Generate sitemap XML from dynamic data
 * @param {Object} options - Configuration options
 * @param {Array} options.vendors - Array of vendor objects
 * @param {Array} options.meals - Array of meal/product objects
 * @returns {string} XML sitemap string
 */
export const generateSitemap = ({ vendors = [], meals = [] }) => {
  const baseUrl = SITE_CONFIG.url;
  const currentDate = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages = [
    { url: "/", changefreq: "daily", priority: "1.0" },
    { url: "/vendors", changefreq: "daily", priority: "0.9" },
    { url: "/meals", changefreq: "daily", priority: "0.8" },
    { url: "/promotions", changefreq: "weekly", priority: "0.8" },
    { url: "/contact", changefreq: "monthly", priority: "0.6" },
  ];

  // Generate vendor pages (only for valid vendors)
  const vendorPages = vendors
    .filter((vendor) => vendor.valid === true)
    .map((vendor) => ({
      url: `/vendor/${encodeURIComponent(vendor.storeName || vendor._id)}`,
      changefreq: "weekly",
      priority: "0.7",
    }));

  // Generate meal detail pages (if applicable)
  const mealPages = meals.map((meal) => ({
    url: `/meals/${meal._id}`,
    changefreq: "weekly",
    priority: "0.6",
  }));

  const allPages = [...staticPages, ...vendorPages, ...mealPages];

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml +=
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  allPages.forEach((page) => {
    xml += "  <url>\n";
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += "  </url>\n";
  });

  xml += "</urlset>";

  return xml;
};

/**
 * Example usage:
 *
 * // In your build script or API endpoint:
 * import { generateSitemap } from './utils/sitemap';
 *
 * const vendors = await fetchVendors();
 * const meals = await fetchMeals();
 *
 * const sitemapXml = generateSitemap({ vendors, meals });
 *
 * // Save to file
 * fs.writeFileSync('public/sitemap.xml', sitemapXml);
 *
 * // Or serve dynamically
 * app.get('/sitemap.xml', (req, res) => {
 *   res.header('Content-Type', 'application/xml');
 *   res.send(sitemapXml);
 * });
 */

/**
 * Generate breadcrumb structured data for navigation
 * @param {Array} breadcrumbs - Array of breadcrumb items
 * @returns {Object} JSON-LD structured data
 */
export const generateBreadcrumbs = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.path}`,
    })),
  };
};

/**
 * Example breadcrumbs usage:
 *
 * const breadcrumbs = generateBreadcrumbs([
 *   { name: 'Home', path: '/' },
 *   { name: 'Vendors', path: '/vendors' },
 *   { name: vendor.storeName, path: `/vendor/${vendor.storeName}` }
 * ]);
 */
