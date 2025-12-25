# Google Ads Quick Start - 5 Minute Setup

## ✅ Code is Ready! Now Do This:

### 1️⃣ Set Up Consent Message (5 min)

**Go to**: https://www.google.com/adsense/ → Privacy & messaging → EU Consent

**Settings**:
- ✅ Enable: "Show a consent message in the EEA and UK"
- ✅ Choose: "Use Google's consent management platform"
- ✅ Select: **"Create message with 3 choices"** ← IMPORTANT!
  - Accept all
  - Reject all
  - Manage options
- ✅ Message position: **Bottom banner**
- ✅ Primary color: `#E67E22` (orange - matches your site)
- ✅ Publisher name: **"Don't Shoot"**
- ✅ Privacy Policy URL: `https://dont-shoot.com/privacy`
- ✅ Click **"Publish"**

**✓ Done!** Consent dialog will show automatically for EU users.

---

### 2️⃣ Add Your Site to AdSense (2 min)

**Go to**: Sites → Add site

**Enter**: `https://dont-shoot.com`

**Verification**: Automatic (code already in your index.html)

**Wait**: 1-2 weeks for approval email

---

### 3️⃣ Create Ad Units (AFTER Approval)

**Go to**: Ads → Overview → By ad unit

**Create Ad Unit #1**:
- Name: `Bounty List Ad`
- Type: Display ads → Responsive
- Copy the **Ad Slot ID** (e.g., `1234567890`)
- Open `.env` file
- Replace `PLACEHOLDER_SLOT_1` with your slot ID:
  ```env
  VITE_AD_SLOT_BOUNTY_LIST=1234567890
  ```

**Create Ad Unit #2**:
- Name: `Leaderboard Bottom Ad`
- Type: Display ads → Responsive
- Copy the **Ad Slot ID**
- Replace `PLACEHOLDER_SLOT_2`:
  ```env
  VITE_AD_SLOT_LEADERBOARD=9876543210
  ```

---

### 4️⃣ Deploy (1 min)

```bash
npm run build
# Upload to your hosting
```

**Test**: Visit https://dont-shoot.com
- Use EU VPN to see consent dialog
- Click "Accept" → Ads should appear
- Go to Bounties → Ad after every 10th bounty
- Go to Leaderboard → Ad at bottom

---

## 🎯 That's It!

Your ads are now:
- ✅ GDPR compliant
- ✅ Non-intrusive
- ✅ Revenue-optimized
- ✅ Premium users see no ads

---

## 📊 Monitor Performance

**Google AdSense Dashboard**: https://www.google.com/adsense/

Watch:
- **Impressions**: How many times ads were shown
- **Clicks**: How many clicks on ads
- **Earnings**: Your revenue
- **Page RPM**: Revenue per 1000 page views

**Expected**: $2-25/month initially, grows with traffic

---

## 🔧 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Consent message not showing | Only shows to EU/EEA users (use VPN to test) |
| Ads not displaying | Wait for AdSense approval (1-2 weeks) |
| Blank ad spaces | Update `.env` with real slot IDs, rebuild, deploy |
| Policy violation warning | Never click your own ads! |

---

## 📝 Checklist

- [ ] Step 1: Set up consent message in AdSense
- [ ] Step 2: Add site `https://dont-shoot.com`
- [ ] Wait for approval email (1-2 weeks)
- [ ] Step 3: Create 2 ad units, copy slot IDs
- [ ] Update `.env` with real slot IDs
- [ ] Step 4: Rebuild and deploy
- [ ] Test with EU VPN
- [ ] Start earning! 💰

---

**Full Guide**: See [GOOGLE_ADS_SETUP.md](GOOGLE_ADS_SETUP.md) for detailed instructions.

**Questions?** Check the troubleshooting section in the full guide.
