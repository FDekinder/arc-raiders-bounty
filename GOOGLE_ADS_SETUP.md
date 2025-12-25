# Google AdSense & Consent Management Setup Guide

## ✅ What's Been Done

### 1. Code Implementation (Complete!)
- ✅ **Google Funding Choices (CMP)** added to [index.html:49-52](index.html#L49-L52)
- ✅ **AdSense script** configured with publisher ID `ca-pub-1748283843272438`
- ✅ **AdUnit component** with GDPR consent integration ([AdUnit.vue](src/components/AdUnit.vue))
- ✅ **Ad placements** in Bounties and Leaderboard views
- ✅ **Environment variables** configured in `.env`

### 2. GDPR Compliance Features
- ✅ Consent dialog will show automatically for EU/EEA/UK/Swiss users
- ✅ 3-choice consent form (Accept, Reject, Manage Options)
- ✅ Ads only show if user consents
- ✅ No ads for premium users
- ✅ TCF v2.2 compliant (Transparency & Consent Framework)

---

## 🚀 Next Steps to Activate Ads

### Step 1: Set Up Google Funding Choices (CMP)

1. **Go to**: https://www.google.com/adsense/
2. **Sign in** with your Google account
3. **Go to**: Privacy & messaging → EU Consent
4. **Enable**: "Show a consent message in the EEA and UK"
5. **Select**: "Use Google's consent management platform"
6. **Choose**: "Create message with 3 choices" (Accept, Reject, Manage options)
7. **Configure your message**:
   - **Message position**: Bottom banner (recommended)
   - **Primary color**: `#E67E22` (Arc Raiders orange - matches your site)
   - **Publisher name**: "Don't Shoot"
   - **Privacy Policy URL**: `https://dont-shoot.com/privacy`
8. **Publish the message**

### Step 2: Verify AdSense Account Setup

1. **Add your site**:
   - Go to Sites → Add site
   - Enter: `https://dont-shoot.com`
   - Click "Save and continue"

2. **Verify site ownership**:
   - Google will detect the AdSense code in your `index.html` (already there!)
   - Should verify automatically ✓

3. **Wait for approval**:
   - Usually 1-2 weeks
   - You'll get an email when approved

### Step 3: Create Ad Units (After Approval)

Once your AdSense account is approved:

1. **Go to**: Ads → Overview → By ad unit
2. **Create 2 ad units**:

#### Ad Unit 1: Bounty List Ad
- Click "New ad unit" → "Display ads"
- **Name**: `Bounty List Ad`
- **Type**: Responsive
- **Sizes**: Auto (let Google optimize)
- Click "Create"
- **Copy the Ad Slot ID** (looks like `1234567890`)
- **Update `.env`**:
  ```env
  VITE_AD_SLOT_BOUNTY_LIST=1234567890
  ```

#### Ad Unit 2: Leaderboard Ad
- Click "New ad unit" → "Display ads"
- **Name**: `Leaderboard Bottom Ad`
- **Type**: Responsive
- **Sizes**: Auto
- Click "Create"
- **Copy the Ad Slot ID**
- **Update `.env`**:
  ```env
  VITE_AD_SLOT_LEADERBOARD=9876543210
  ```

### Step 4: Deploy & Test

1. **Rebuild with new ad slot IDs**:
   ```bash
   npm run build
   ```

2. **Deploy to production**: Upload to your hosting

3. **Test the consent flow**:
   - Visit `https://dont-shoot.com`
   - If you're in EU/EEA, you'll see the consent dialog
   - **To test from anywhere**: Use a VPN to simulate EU location
   - Click "Accept" → Ads should load
   - Click "Reject" → No ads shown

4. **Test ad display**:
   - Go to Bounties page → Scroll down → Ad appears after every 10th bounty
   - Go to Leaderboard → Scroll to bottom → Ad appears at bottom
   - In dev mode: Shows "Ad Placeholder" (correct!)
   - In production: Shows real ads (after approval)

---

## 📊 How It Works

### Consent Flow (GDPR Compliance)

```
User visits site (from EU/EEA/UK/Switzerland)
  ↓
Google Funding Choices loads
  ↓
Consent dialog appears (3 choices)
  ↓
┌─────────────────────────────────────┐
│ 1. Accept all      (personalized)   │
│ 2. Reject all      (no ads)         │
│ 3. Manage options  (customize)      │
└─────────────────────────────────────┘
  ↓
User choice saved via TCF v2.2
  ↓
AdUnit component checks consent
  ↓
If consent = YES → Show ads
If consent = NO  → Hide ads
```

### Ad Display Logic ([AdUnit.vue:58-104](src/components/AdUnit.vue#L58-L104))

```typescript
1. Is user premium? → No ads
2. Is user in GDPR region? → Check consent
   - Has consent? → Show ads
   - No consent? → Hide ads
3. User clicked "Reject all"? → Hide ads
4. User clicked "Accept"? → Show ads
5. Load AdSense and display ad
```

### Ad Placements

| Page | Location | Frequency | Ad Slot |
|------|----------|-----------|---------|
| **Bounties** | Between bounty cards | Every 10th bounty | `VITE_AD_SLOT_BOUNTY_LIST` |
| **Leaderboard** | Bottom of page | Once at end | `VITE_AD_SLOT_LEADERBOARD` |

---

## 💰 Revenue Expectations

### Initial Phase (Months 1-3)
- **Traffic**: 500-1,000 visitors/month
- **Ad Impressions**: 2,000-5,000/month
- **CPM**: $1-$5 (gaming niche)
- **Est. Revenue**: $2-$25/month

### Growth Phase (Months 3-6)
- **Traffic**: 2,000-5,000 visitors/month
- **Ad Impressions**: 10,000-25,000/month
- **Est. Revenue**: $10-$125/month

### Factors that increase revenue:
- ✅ More traffic (SEO, social media, content)
- ✅ Engaged users (longer session time)
- ✅ Higher consent rate (optimize message)
- ✅ Strategic ad placement (already optimized!)

---

## 🔧 Troubleshooting

### Issue: "Consent message not showing"
**Solution**:
- Check you're in EU/EEA/UK (or use VPN)
- Message only shows to users in GDPR regions
- Clear cookies and reload

### Issue: "Ads not displaying (blank space)"
**Solutions**:
1. Check AdSense approval status (must be approved first)
2. Verify ad slot IDs in `.env` are correct
3. Check browser console for errors
4. Disable ad blocker
5. Wait 24-48 hours after creating ad units

### Issue: "AdSense policy violation"
**Common violations to avoid**:
- ❌ Don't click your own ads
- ❌ Don't encourage others to click
- ❌ Don't place ads on prohibited content
- ❌ Don't have too many ads per page (you're good - 2 total)

### Issue: "Low ad fill rate"
**Solutions**:
- Enable auto ads (AdSense dashboard)
- Allow more ad formats (text + display)
- Increase site traffic (more traffic = better fill)

---

## 📈 Optimization Tips

### 1. Increase Consent Rate
**Default**: ~40% of EU users accept
**Target**: 60-70%

**How**:
- Use clear, simple language in consent message
- Highlight benefits: "Support free content"
- Make "Accept" button prominent
- Use site's brand colors (already done: `#E67E22`)

### 2. Improve Ad Revenue
- **More ad placements**: Add to Activity Feed, FAQ (optional)
- **Better ad positions**: Above the fold ads get 2x CPM
- **A/B test**: Try different ad formats (horizontal vs square)
- **Enable auto ads**: Let Google optimize placements

### 3. Monitor Performance
**Google AdSense Dashboard**:
- Click-through rate (CTR): Target 0.5-2%
- Page RPM: Revenue per 1000 page views
- Viewable impressions: Target 80%+

---

## 🎯 Current Setup Summary

### Files Modified:
- ✅ `index.html` - Added Funding Choices CMP script
- ✅ `src/components/AdUnit.vue` - GDPR consent integration
- ✅ `src/views/BountiesView.vue` - Ad slot configured (line 46)
- ✅ `src/views/LeaderboardView.vue` - Ad slot configured (line 32)
- ✅ `.env` - AdSense configuration

### Environment Variables:
```env
VITE_ADSENSE_CLIENT_ID=ca-pub-1748283843272438
VITE_ADSENSE_ENABLED=true
VITE_AD_SLOT_BOUNTY_LIST=PLACEHOLDER_SLOT_1  # ← Update after creating ad unit
VITE_AD_SLOT_LEADERBOARD=PLACEHOLDER_SLOT_2  # ← Update after creating ad unit
```

### What Happens in Dev Mode:
- Shows gray "Ad Placeholder" boxes
- Console logs: "AdSense in test mode"
- No real ads loaded (saves quota)

### What Happens in Production:
- EU/EEA users see consent dialog
- Ads load only after consent
- No ads for premium users
- Revenue starts accruing!

---

## 📝 Checklist

### Before Deployment:
- [x] Funding Choices script added to `index.html`
- [x] AdSense script configured
- [x] AdUnit component updated with consent logic
- [x] Ad placements added to views
- [x] Environment variables set
- [ ] Privacy policy updated (mention cookies/ads)

### In Google AdSense Dashboard:
- [ ] Enable Funding Choices (EU Consent)
- [ ] Configure 3-choice consent message
- [ ] Customize colors to match site (`#E67E22`)
- [ ] Set Privacy Policy URL: `https://dont-shoot.com/privacy`
- [ ] Add site: `https://dont-shoot.com`
- [ ] Wait for approval (1-2 weeks)
- [ ] Create ad units (after approval)
- [ ] Update `.env` with real ad slot IDs

### After Deployment:
- [ ] Test consent dialog (use EU VPN if needed)
- [ ] Verify ads display after consent
- [ ] Check no ads show after rejection
- [ ] Monitor AdSense dashboard for impressions
- [ ] Check browser console for errors
- [ ] Test on mobile devices

---

## 🎉 You're All Set!

Your site now has:
- ✅ **GDPR-compliant consent management**
- ✅ **Non-intrusive ad placements**
- ✅ **Premium user ad-free experience**
- ✅ **Automatic consent handling**
- ✅ **Revenue-optimized ad positions**

### Next: Complete the Google AdSense setup
1. Go to https://www.google.com/adsense/
2. Follow Steps 1-3 above
3. Update `.env` with real ad slot IDs
4. Deploy and start earning! 💰

---

## 📚 Resources

- **Google AdSense**: https://www.google.com/adsense/
- **Funding Choices Help**: https://support.google.com/fundingchoices
- **AdSense Policies**: https://support.google.com/adsense/answer/48182
- **TCF v2.2 Spec**: https://iabeurope.eu/tcf-2-0/
- **GDPR Guide**: https://gdpr.eu/

Good luck! 🚀
