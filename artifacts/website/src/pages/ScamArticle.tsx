import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Link, useRoute } from "wouter";
import { useState } from "react";
import {
  getArticle,
  getRelatedArticles,
  type ArticleBlock,
} from "@/data/scamArticles";
import NotFound from "@/pages/not-found";
import {
  AlertTriangle,
  ShieldCheck,
  Info,
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Share2,
  Check,
  XCircle,
  CheckCircle2,
} from "lucide-react";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-5">
          {block.body}
        </h2>
      );
    case "text":
      return (
        <p className="text-lg text-gray-700 leading-relaxed mb-5">
          {block.body}
        </p>
      );
    case "list":
      return (
        <ul className="space-y-3 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-lg text-gray-700">
              <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-4 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-4 text-lg text-gray-700">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "signs":
      return (
        <ul className="space-y-3 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-lg text-gray-700">
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const styles = {
        danger: {
          wrap: "bg-red-50 border-red-200",
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          title: "text-red-900",
          body: "text-red-800",
        },
        safe: {
          wrap: "bg-green-50 border-green-200",
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          title: "text-green-900",
          body: "text-green-800",
        },
        info: {
          wrap: "bg-blue-50 border-blue-200",
          icon: <Info className="h-6 w-6 text-blue-600" />,
          title: "text-blue-900",
          body: "text-blue-800",
        },
      }[block.tone];
      return (
        <div className={`my-8 p-6 rounded-2xl border ${styles.wrap}`}>
          <div className="flex items-center gap-3 mb-2">
            {styles.icon}
            <h3 className={`text-lg font-bold ${styles.title}`}>
              {block.title}
            </h3>
          </div>
          <p className={`text-base leading-relaxed ${styles.body} mb-0`}>
            {block.body}
          </p>
        </div>
      );
    }
    default:
      return null;
  }
}

export default function ScamArticle() {
  const [, params] = useRoute("/cyber-safety-center/:slug");
  const [copied, setCopied] = useState(false);
  const article = params?.slug ? getArticle(params.slug) : undefined;

  if (!article) {
    return <NotFound />;
  }

  const related = getRelatedArticles(article.slug);
  const articleUrl = `https://netraksh.com/cyber-safety-center/${article.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: articleUrl,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: "Netraksh" },
    publisher: {
      "@type": "Organization",
      name: "Netraksh",
      logo: {
        "@type": "ImageObject",
        url: "https://netraksh.com/images/netraksh-logo.png",
      },
    },
    mainEntityOfPage: articleUrl,
  };

  return (
    <Layout>
      <SEOHead
        title={article.title}
        description={article.excerpt}
        url={articleUrl}
        type="article"
        schema={schema}
      />
      <article className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            href="/cyber-safety-center"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cyber Safety Center
          </Link>

          <span className="px-3 py-1 bg-blue-50 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-5 mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Updated {article.updated}
            </span>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline ml-auto"
              aria-label="Share this article"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Link copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Share
                </>
              )}
            </button>
          </div>

          <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium">
            {article.excerpt}
          </p>

          <div>
            {article.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-gray-900 text-white text-center">
            <ShieldCheck className="h-10 w-10 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              Report fraud immediately
            </h3>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
              If you or someone you know has been targeted, call the National
              Cyber Crime Helpline <strong className="text-white">1930</strong>{" "}
              or report online. Acting fast gives the best chance to recover your
              money.
            </p>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-gray-900 font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Report at cybercrime.gov.in
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>

      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related guides
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/cyber-safety-center/${rel.slug}`}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                  {rel.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2 group-hover:text-primary transition-colors">
                  {rel.title}
                </h3>
                <span className="text-primary font-medium text-sm inline-flex items-center gap-1">
                  Read guide <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
