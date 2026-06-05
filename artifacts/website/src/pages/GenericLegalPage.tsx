import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";

export default function GenericLegalPage({ title, description, content }: { title: string, description: string, content?: string }) {
  return (
    <Layout>
      <SEOHead title={`${title} | Netraksh`} description={description} />
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <div className="prose prose-lg text-gray-600 max-w-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-500 mb-0">This document is being updated to reflect the latest compliance standards. Please check back soon.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}