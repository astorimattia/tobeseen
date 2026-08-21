import React from "react";
import Link from "next/link";
import Footer from "../components/Footer";

export const metadata = {
  title: "Privacy Policy - Sacratos",
  description: "Learn how Sacratos collects and uses data on sacratos.com. We value your privacy and are transparent about our practices.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link 
          href="/" 
          className="inline-block mb-8 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Back to home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-zinc-500 mb-8">Last updated: January 2026</p>

          <p className="text-xl text-zinc-300 leading-relaxed mb-8">
            At Sacratos, we value your privacy and are committed to being transparent about how we collect and use data.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What We Collect</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            This website uses basic analytics to understand how visitors interact with our content. We use Vercel Analytics and 
            Microsoft Clarity to collect anonymized usage data such as page views, time on site, and general geographic location 
            (country level only). This helps us improve the website experience and understand which stories resonate with our audience.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We do not collect personally identifiable information unless you voluntarily provide it through email subscription or 
            direct contact. We do not sell, rent, or share your personal data with third parties for marketing purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Email Newsletter</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            If you subscribe to our newsletter through the Substack signup form on this website, your email address is collected 
            and stored by Substack, Inc. We use Substack to send occasional updates about new documentary projects, photo essays, 
            and stories. You can unsubscribe at any time using the link at the bottom of any email.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            Substack's privacy practices are governed by their own privacy policy. We do not have access to any payment information 
            if you choose to become a paid subscriber on Substack.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Cookies and Tracking</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            This website uses cookies for essential functionality and analytics. Vercel Analytics uses cookies to track anonymized 
            usage patterns. Microsoft Clarity uses cookies to understand user behavior through session recordings and heatmaps. 
            These tools help us identify usability issues and improve the website.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We do not use advertising cookies or retargeting pixels. We do not track users across other websites. All analytics 
            data is anonymized and aggregated.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Third-Party Services</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            This website is hosted on Vercel, a cloud hosting platform. Vercel may collect technical logs as part of normal server 
            operations. Images and videos may be served through Vercel's CDN for faster loading times.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            External links to Instagram, Substack, and other platforms are governed by those platforms' respective privacy policies. 
            We are not responsible for the privacy practices of external websites.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Your Rights</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            You have the right to request access to any personal data we hold about you, to request corrections, or to request 
            deletion. Since we collect minimal personal data, most requests can be fulfilled quickly. To exercise these rights, 
            contact us at mattia@sacratos.com.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            If you're located in the European Union, you have additional rights under GDPR, including the right to data portability 
            and the right to object to processing. If you're located in California, you have rights under CCPA.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Data Security</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We take reasonable precautions to protect any data we collect. This website uses HTTPS encryption for all connections. 
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Children's Privacy</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            This website is not directed at children under the age of 13, and we do not knowingly collect personal information 
            from children. Some of our documentary content depicts dangerous activities and may not be suitable for all audiences.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Changes to This Policy</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last updated" 
            date. Continued use of the website after changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Contact</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            If you have questions about this privacy policy or how we handle your data, contact us at <a href="mailto:mattia@sacratos.com" className="text-white underline underline-offset-4">mattia@sacratos.com</a>.
          </p>

          <div className="mt-16 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Sacratos is a documentary photography project by Daniele Colucci and Mattia Astori.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
