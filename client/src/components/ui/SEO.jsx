import React, { useEffect } from 'react';

const SEO = ({
  title = 'Pairly — Premium Couples App & Private Relationship Sanctuary',
  description = 'Pairly is the #1 private couples app for time-capsule letters, relationship timeline, daily mood check-ins, shared memories, map places, and shared playlists.',
  keywords = 'couples app, relationship app, future letters, relationship timeline, mood check-in, shared playlist, relationship map',
  canonicalUrl = 'https://pairly-web.onrender.com',
}) => {
  useEffect(() => {
    // Dynamic document title
    document.title = title;

    // Helper function to update meta tags
    const updateMetaTag = (selector, attribute, value) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (selector.startsWith('meta[name=')) {
          tag.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
        } else if (selector.startsWith('meta[property=')) {
          tag.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute(attribute, value);
    };

    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="twitter:title"]', 'content', title);
    updateMetaTag('meta[property="twitter:description"]', 'content', description);

    // Update canonical link tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);
  }, [title, description, keywords, canonicalUrl]);

  return null;
};

export default SEO;
