# Sara Solar SEO deployment and measurement

## Implemented in the application

- Sara Solar homepage title, visible brand identity, WebSite data and business alias.
- Consistent page title suffix and social site name; product-specific share images.
- Canonical sitemap entries only, with product modification dates only when known.
- Product offers only when a finite positive price is available. Quote-only products do not qualify for offer-based rich results; do not invent prices or reviews.
- Visible calculator answers matching FAQ markup. FAQ markup does not promise a Google rich result.
- Admin no-index metadata; admin/API excluded from crawl instructions.
- Optional GOOGLE_SITE_VERIFICATION environment variable for Search Console HTML verification.
- Escaped JSON-LD so product text cannot terminate the script tag.

## Before deploying

1. Run `npm --prefix frontend test`, `npm --prefix frontend run typecheck` and `npm --prefix frontend run build` with Node 22 or later.
2. Configure production Supabase credentials. With no credentials the app deliberately uses demo data; do not deploy that mode as a live catalogue.
3. Choose the canonical hostname in hosting and set NEXT_PUBLIC_SITE_URL to the same HTTPS origin. The code defaults to https://sarasolars.com. The supplied Google screenshot displays www; inspect Google's selected canonical before deciding to change a current hostname. Configure a permanent redirect from the other hostname at the hosting/CDN layer, preserving paths and query strings. Avoid a redirect loop with existing hosting rules.
4. Verify business claims (project counts, installed capacity, certifications, warranty coverage and partner claims) against records. Publish real project photographs and case studies with permission. Do not manufacture ratings, testimonials or project history.
5. Verify the published address, phone and hours against the admin settings and business listing. Existing defaults disagree on 08:00 versus 08:30 opening time; confirm the real hours before adding structured opening hours.

## After deployment — account access required

- Verify a Search Console domain property using its DNS instructions, or use its HTML token with GOOGLE_SITE_VERIFICATION and rebuild.
- Run URL Inspection > Test live URL on the homepage and a product page. Confirm successful fetching and rendered content, then request indexing for the homepage. Submit /sitemap.xml once; repeated requests do not speed indexing.
- Inspect Page indexing, Crawl stats and Google's selected canonical. During the audit, the apex homepage returned a Cloudflare 403 challenge to an ordinary automated request. This does not establish that verified Googlebot is blocked. Use the live test and Cloudflare security events to identify any applicable rule; allow verified search crawlers without disabling protection globally or trusting only a spoofable User-Agent.
- Test product pages in Google's Rich Results Test. Check that prices, stock and images agree with visible content. Test the homepage website/business data with Schema.org Validator.
- Claim or update the real Google Business Profile. Use the actual business name and accurate category, address, hours, phone and website. Add original office/product/project photos. Ask real customers for honest reviews without incentives.
- Check mobile PageSpeed Insights and Search Console Core Web Vitals after deployment. Optimize the actual LCP resource and layout shifts shown by those reports; no performance score is claimed by this change.
- Keep legitimate supplier, partner and business directory profiles consistent and link them to the canonical website. Do not buy links or create keyword-stuffed listings.

## Measure results

Record a baseline and compare approximately 28-day periods in Search Console, filtering Ethiopia and separating branded queries (Sara Solar, Sara Solars, Sara Power Solution) from product/service searches. Track impressions, clicks, CTR, average position, indexed pages and actual inquiries. A screenshot is one search observation, not a stable global rank. Content and technical fixes require deployment and recrawling; first place is not guaranteed.

## References

- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/structured-data/product-snippet
