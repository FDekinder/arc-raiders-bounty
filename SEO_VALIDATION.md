# SEO Validation & Testing

## Before Going Live - Checklist

### 1. Test Meta Tags
Visit your deployed site and check:
- View page source (Ctrl+U)
- Verify all meta tags are present
- Check Open Graph tags
- Validate JSON-LD structured data at: https://search.google.com/test/rich-results

### 2. Test robots.txt
- Visit: `https://dontshoot.gg/robots.txt`
- Should see the robots.txt content
- Validate at: https://www.google.com/webmasters/tools/robots-testing-tool

### 3. Test sitemap.xml
- Visit: `https://dontshoot.gg/sitemap.xml`
- Should see XML sitemap with all URLs
- Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html

### 4. Test Open Graph Preview
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Inspector: https://www.linkedin.com/post-inspector/

### 5. Mobile-Friendly Test
- Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- Should pass all checks

### 6. Page Speed Test
- Google PageSpeed Insights: https://pagespeed.web.dev/
- Target: 90+ score on mobile and desktop
- Lighthouse (Chrome DevTools): Run audit

### 7. Schema Markup Validation
- Google Rich Results Test: https://search.google.com/test/rich-results
- Validate your JSON-LD structured data

## Quick SEO Audit Commands

### Check if site is indexed
```
site:dontshoot.gg
```
Google search to see indexed pages

### Check for specific keywords
```
site:dontshoot.gg "Arc Raiders"
site:dontshoot.gg "bounty system"
```

### Check backlinks
```
link:dontshoot.gg
```

## Common Issues & Fixes

### Issue: Meta tags not showing
**Fix**: Make sure Vue builds with SSR or use prerendering for static sites

### Issue: Images not loading in OG preview
**Fix**: Use absolute URLs (https://dontshoot.gg/og-image.png)

### Issue: Sitemap not accessible
**Fix**: Ensure file is in `/public` directory and rebuilds on deploy

### Issue: robots.txt blocking important pages
**Fix**: Review Allow/Disallow rules

## Production Deployment Checklist

- [ ] Update all URLs from localhost to production domain
- [ ] Update `index.html` canonical URL
- [ ] Update `sitemap.xml` with production domain
- [ ] Update `useSEO.ts` baseUrl to production
- [ ] Ensure HTTPS is enabled
- [ ] Create and upload `og-image.png`
- [ ] Test all social media previews
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Enable GZIP/Brotli compression on server

## After Launch

### Week 1
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Share on social media
- [ ] Post in Arc Raiders communities

### Week 2-4
- [ ] Monitor Google Search Console for issues
- [ ] Check Google Analytics for traffic
- [ ] Fix any crawl errors
- [ ] Optimize slow pages

### Ongoing
- [ ] Publish new content regularly
- [ ] Build backlinks
- [ ] Monitor keyword rankings
- [ ] Update sitemap when adding new pages
- [ ] Respond to user reviews/feedback
- [ ] Keep content fresh and updated
