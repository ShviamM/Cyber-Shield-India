import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  url?: string;
  type?: string;
  image?: string;
  schema?: Record<string, any>;
}

const SITE_ORIGIN = "https://netraksh.com";

function resolveUrl(url?: string) {
  if (url) return url;
  if (typeof window !== "undefined") {
    return `${SITE_ORIGIN}${window.location.pathname}`.replace(/\/$/, "") || SITE_ORIGIN;
  }
  return SITE_ORIGIN;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function SEOHead({
  title,
  description,
  url,
  type = "website",
  image = "https://netraksh.com/images/og-image.png",
  schema,
}: SEOHeadProps) {
  const fullTitle = `${title} | Netraksh - India's Digital Bodyguard`;

  useEffect(() => {
    const pageUrl = resolveUrl(url);
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", "index, follow");

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", pageUrl);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:site_name", "Netraksh");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    upsertLink("canonical", pageUrl);
  }, [fullTitle, description, url, type, image]);

  return (
    <>
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </>
  );
}
