import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Mail, MessageSquare, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ApiError, submitContactMessage, type ContactMessageRequestSubject } from "@workspace/api-client-react";

export default function Contact() {
  const { t, i18n } = useTranslation("misc");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await submitContactMessage({
        name: form.name,
        email: form.email,
        subject: form.subject as ContactMessageRequestSubject,
        message: form.message,
        lang: i18n.language?.startsWith("hi") ? "hi" : "en",
      });
      setSubmitted(true);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setError(
        status === 429
          ? t("contact.form.rateLimited")
          : status === 400
            ? t("contact.form.invalidEmail")
            : t("contact.form.error"),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <SEOHead 
        title={t("contact.seoTitle")} 
        description={t("contact.seoDescription")}
      />
      <PageHero title={t("contact.heading")} subtitle={t("contact.subheading")} />
      <div className="container mx-auto px-4 pt-14 pb-16 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl mb-1">{t("contact.support.title")}</h3>
                  <p className="text-gray-600 mb-2">{t("contact.support.desc")}</p>
                  <a href="mailto:support@netraksh.com" className="text-primary font-medium hover:underline">support@netraksh.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl mb-1">{t("contact.business.title")}</h3>
                  <p className="text-gray-600 mb-2">{t("contact.business.desc")}</p>
                  <a href="mailto:partners@netraksh.com" className="text-orange-600 font-medium hover:underline">partners@netraksh.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl mb-1">{t("contact.media.title")}</h3>
                  <p className="text-gray-600 mb-2">{t("contact.media.desc")}</p>
                  <a href="mailto:press@netraksh.com" className="text-green-600 font-medium hover:underline">press@netraksh.com</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl mb-2">{t("contact.success.title")}</h3>
                <p className="text-gray-600">{t("contact.success.desc")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.form.nameLabel")}</Label>
                  <Input id="name" value={form.name} onChange={update("name")} maxLength={120} placeholder={t("contact.form.namePlaceholder")} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.form.emailLabel")}</Label>
                  <Input id="email" type="email" value={form.email} onChange={update("email")} maxLength={254} placeholder={t("contact.form.emailPlaceholder")} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact.form.subjectLabel")}</Label>
                  <select id="subject" value={form.subject} onChange={update("subject")} className="w-full h-12 px-3 border border-input rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                    <option value="">{t("contact.form.subjectPlaceholder")}</option>
                    <option value="support">{t("contact.form.subjectSupport")}</option>
                    <option value="partnership">{t("contact.form.subjectPartnership")}</option>
                    <option value="media">{t("contact.form.subjectMedia")}</option>
                    <option value="other">{t("contact.form.subjectOther")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact.form.messageLabel")}</Label>
                  <Textarea id="message" value={form.message} onChange={update("message")} maxLength={5000} placeholder={t("contact.form.messagePlaceholder")} rows={5} required className="resize-none" />
                </div>
                {error && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={sending} className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white">
                  {sending ? t("contact.form.sending") : t("contact.form.submit")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}