import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateMetaTags, generateStructuredData } from '../utils/seo';

/**
 * SEO Component - Manages document head meta tags for SEO
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string|string[]} props.keywords - SEO keywords
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.type - Open Graph type (website, article, product, etc.)
 * @param {boolean} props.noindex - Whether to prevent indexing
 * @param {Object} props.structuredData - JSON-LD structured data
 * @param {string} props.canonical - Canonical URL
 */
const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  noindex = false,
  structuredData,
  canonical
}) => {
  const location = useLocation();

  useEffect(() => {
    // Generate meta tags
    const metaTags = generateMetaTags({
      title,
      description,
      keywords,
      image,
      type,
      noindex,
      canonical: canonical || `${window.location.origin}${location.pathname}`
    });

    // Set document title
    if (metaTags.title) {
      document.title = metaTags.title;
    }

    // Remove existing meta tags that we'll be replacing
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new meta tags
    metaTags.meta.forEach(({ name, property, content }) => {
      if (content) {
        const meta = document.createElement('meta');
        meta.setAttribute('data-seo', 'true');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    // Add canonical link
    if (metaTags.link && metaTags.link.length > 0) {
      metaTags.link.forEach(({ rel, href }) => {
        const link = document.createElement('link');
        link.setAttribute('rel', rel);
        link.setAttribute('href', href);
        document.head.appendChild(link);
      });
    }

    // Add structured data (JSON-LD)
    const existingStructuredData = document.querySelector('script[data-structured-data="true"]');
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Keep meta tags on unmount as they'll be replaced by the next page
    };
  }, [title, description, keywords, image, type, noindex, location.pathname, canonical, structuredData]);

  return null; // This component doesn't render anything
};

export default SEO;
