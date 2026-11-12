import { LegalPage } from '@/components/legal/LegalPage';
import { OFFICIAL_EMAIL } from '@/lib/constants';
import { buildPageMetadata } from '@/lib/server/seo';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: 'How Sara Solar handles personal information, enquiries and contact requests through sarasolars.com.',
  path: '/privacy-policy',
});

function Email() {
  return <a href={`mailto:${OFFICIAL_EMAIL}`}>{OFFICIAL_EMAIL}</a>;
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" relatedHref="/terms" relatedTitle="Terms of Use">
      <p>This policy explains how SARA SOLAR collects, uses and protects personal information when you visit sarasolars.com, send an enquiry, call us, or reach us through WhatsApp or our social media accounts.</p>
      <section><h2>Who we are</h2><p>SARA SOLAR is the solar solutions website of Sara Power Solution PLC in Addis Ababa, Ethiopia. For privacy questions, write to <Email />.</p></section>
      <section><h2>Information we collect</h2><p>When you contact us, we collect the details you choose to share, such as your name, email address, mobile number, location, preferred solar brand and project requirements, so we can reply. If you send a calculator result through WhatsApp, the message includes the sizing details you choose to send.</p><p>Our website and hosting providers may process standard technical data such as IP address, browser type, device and pages requested to deliver and protect the site.</p></section>
      <section><h2>How we use it</h2><p>We use this information to respond to enquiries, prepare quotations, follow up on solar solutions, and improve and protect the website. We do not sell your personal information.</p></section>
      <section><h2>Consent</h2><p>When you send an enquiry, you authorise SARA SOLAR to use the details you provide to contact you about that request by phone, email or WhatsApp. You can withdraw consent at any time by writing to <Email />. Withdrawing consent does not affect processing that has already taken place.</p></section>
      <section><h2>Where your enquiry is stored</h2><p>Details you send by email or WhatsApp are processed through those communication services and retained in the enquiry records used by our team. Access is limited to people handling SARA SOLAR enquiries. The services you use to contact us also process information under their own privacy policies.</p></section>
      <section><h2>Cookies and third-party platforms</h2><p>The website uses browser storage to remember your display theme. Our hosting and security providers may use cookies or similar technologies to keep the website secure. You can manage cookies and storage in your browser settings.</p><p>Following a link to WhatsApp, Instagram or Facebook takes you to a third-party service whose own privacy and advertising policies apply. If we introduce advertising tools such as the Meta Pixel on this website, we will update this policy and provide any required choices before activating them.</p></section>
      <section><h2>How long we keep it</h2><p>Enquiry records are kept for as long as needed to handle your request and for legitimate business records, then deleted or anonymised when they are no longer required, unless law requires a longer period.</p></section>
      <section><h2>Your rights</h2><p>You may ask us for a copy of the personal data we hold about you, ask us to correct it, or ask us to delete it, subject to legal obligations. Contact <Email />. We handle requests in line with applicable Ethiopian data protection law.</p></section>
      <section><h2>Children</h2><p>This website and our solar services are intended for adults. We do not knowingly collect personal information from children.</p></section>
      <section><h2>Changes</h2><p>We may update this policy from time to time. The “Last updated” date at the top of this page will change when we do. Please review the revised policy for changes to how we handle information.</p></section>
    </LegalPage>
  );
}
