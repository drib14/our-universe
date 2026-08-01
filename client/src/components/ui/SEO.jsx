import React, { useEffect } from 'react';

const SEO = ({
  title = 'Pairly — Premium Couples App & Private Relationship Sanctuary',
  description = 'Pairly is the #1 private couples app for time-capsule letters, relationship timeline, daily mood check-ins, shared memories, map places, and couple quests.',
  keywords = 'couples app, relationship app, future letters, relationship timeline, mood check-in, shared playlist, relationship map, couples quests',
  canonicalUrl = 'https://pairly.app',
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
  }, [title, description, keywords]);

  return null;
};

export default SEO;
