import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  url?: string;
  type?: string;
  image?: string;
  schema?: Record<string, any>;
}

export function SEOHead({
  title,
  description,
  url = "https://netraksh.com",
  type = "website",
  image = "https://netraksh.com/images/og-image.png",
  schema,
}: SEOHeadProps) {
  useEffect(() => {
    // Update simple tags that can be mutated via JS
    document.title = `${title} | Netraksh - India's Digital Bodyguard`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);
    
    // Clean up dynamic tags on unmount if needed, though usually overwriting is fine
  }, [title, description]);

  return (
    <>
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </>
  );
}