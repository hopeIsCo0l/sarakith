import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { OFFICIAL_EMAIL } from '@/lib/constants';
import { buildPageMetadata } from '@/lib/server/seo';

export const metadata = buildPageMetadata({
  title: 'Terms of Use',
  description: 'Terms for using sarasolars.com and sending enquiries to Sara Solar in Addis Ababa, Ethiopia.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" relatedHref="/privacy-policy" relatedTitle="Privacy Policy">
      <p>These terms apply when you use sarasolars.com or send SARA SOLAR an enquiry. If you do not agree, please do not use the site.</p>
      <section><h2>About the site</h2><p>sarasolars.com is an informational website for SARA SOLAR solar solutions in Addis Ababa. Content is for general information. Product availability, brands and specifications are confirmed in a written quotation — not by this website alone.</p></section>
      <section><h2>Enquiries are not a contract</h2><p>Requesting a quote, calling, or messaging us is a request for information. It does not create a sale, installation contract, or price commitment. Any project proceeds only on a written quote or agreement that you accept.</p></section>
      <section><h2>Your details</h2><p>You confirm that information you submit is accurate and that you are authorised to be contacted at the phone number and email you provide. How we handle that information is set out in our <Link href="/privacy-policy">Privacy Policy</Link>.</p></section>
      <section><h2>Brands and third parties</h2><p>Brand names and logos on this site belong to their owners. SARA SOLAR deals in those products; listing a brand does not mean the manufacturer endorses this website.</p></section>
      <section><h2>Acceptable use</h2><p>Do not misuse the site, attempt to disrupt it, submit false enquiries, or use it for anything unlawful.</p></section>
      <section><h2>Liability</h2><p>The site is provided as-is. To the extent permitted by applicable law, SARA SOLAR is not liable for losses arising only from use of the website or from relying on website copy instead of a written quotation. Nothing here limits liability that cannot be limited by law.</p></section>
      <section><h2>Governing law</h2><p>These terms are governed by the laws of Ethiopia. Courts in Addis Ababa have jurisdiction, without affecting any rights you have as a consumer that cannot be waived.</p></section>
      <section><h2>Contact</h2><p>SARA SOLAR — Addis Ababa, Ethiopia. Email <a href={`mailto:${OFFICIAL_EMAIL}`}>{OFFICIAL_EMAIL}</a>.</p></section>
    </LegalPage>
  );
}
