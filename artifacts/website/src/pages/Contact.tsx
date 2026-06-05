import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Mail, MessageSquare, Building2 } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <SEOHead 
        title="Contact Us | Netraksh Support" 
        description="Get in touch with the Netraksh team for support, business enquiries, partnership requests, or media."
      />
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in touch</h1>
            <p className="text-xl text-gray-600 mb-12">Whether you need support, want to partner with us, or have media enquiries, we're here to help.</p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">User Support</h3>
                  <p className="text-gray-600 mb-2">Need help with the app? Our support team is available.</p>
                  <a href="mailto:support@netraksh.com" className="text-primary font-medium hover:underline">support@netraksh.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Business & Partnerships</h3>
                  <p className="text-gray-600 mb-2">Interested in API access or institutional partnerships?</p>
                  <a href="mailto:partners@netraksh.com" className="text-orange-600 font-medium hover:underline">partners@netraksh.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Media Enquiries</h3>
                  <p className="text-gray-600 mb-2">For press kits and media interviews.</p>
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
                <h3 className="text-2xl font-bold mb-2">Message Received</h3>
                <p className="text-gray-600">Thank you for reaching out. Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select id="subject" className="w-full h-12 px-3 border border-input rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                    <option value="">Select a topic...</option>
                    <option value="support">App Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="media">Media Enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="How can we help you?" rows={5} required className="resize-none" />
                </div>
                <Button type="submit" className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}