# Welcome Modal Testing Guide

The Welcome Modal has been successfully implemented! Here's how to test it.

## What Was Implemented

✅ **WelcomeModal.vue** - Daily welcome modal with community guidelines
✅ **CommunityGuidelinesView.vue** - Full community guidelines page
✅ **Route added** - `/community-guidelines` (public page, no login required)
✅ **Modal integrated** - Added to App.vue, shows on every page load (once per day)

## Features

### Welcome Modal
- Shows **once per day** per device using localStorage
- **Cannot be closed** by clicking overlay (user must agree)
- Requires **checkbox agreement** before continuing
- **Version tracking** - Update `GUIDELINES_VERSION` to force re-show to all users
- Beautiful **dark theme** with heartbeat animation
- Fully **responsive** on mobile

### Community Guidelines Page
- Accessible at `/community-guidelines`
- **Public page** - no login required
- Professional design matching the site theme
- Clear sections for rules, prohibited behavior, consequences

## How to Test

### 1. First Visit Test
1. Open your browser
2. Navigate to `http://localhost:5173` (or your dev URL)
3. **Expected**: Welcome modal appears immediately
4. Try clicking outside the modal → It should NOT close
5. Click "I Agree" button while checkbox is unchecked → Button should be disabled
6. Check the agreement checkbox
7. Click "I Agree - Let's Have Fun!" button
8. **Expected**: Modal closes and saves to localStorage

### 2. Same Day Test
1. Refresh the page multiple times
2. **Expected**: Modal does NOT appear again (already seen today)
3. Navigate to different pages
4. **Expected**: Modal still does not appear

### 3. Next Day Test
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Find `welcome_modal_last_shown`
4. Delete this entry (or change the date to yesterday)
5. Refresh the page
6. **Expected**: Modal appears again

### 4. Version Update Test
1. Open `src/components/WelcomeModal.vue`
2. Change `GUIDELINES_VERSION` from `'1.0'` to `'1.1'`
3. Save the file
4. Refresh the page
5. **Expected**: Modal appears again (even if seen today)
6. This simulates updating community guidelines

### 5. Mobile Responsive Test
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device (iPhone 12, Galaxy S20, etc.)
4. Clear localStorage and refresh
5. **Expected**:
   - Modal content is scrollable
   - Button becomes full-width
   - Text sizes are appropriate
   - No horizontal overflow

### 6. Community Guidelines Page Test
1. Navigate to `/community-guidelines`
2. **Expected**:
   - Page loads without requiring login
   - All sections display correctly
   - "Report an Issue" link works
   - Heart icon animates
   - Responsive on mobile

### 7. Navigation Test
1. Add a link to Community Guidelines in your footer/navigation
2. Example for FAQ page:
   ```vue
   <RouterLink to="/community-guidelines">
     Community Guidelines
   </RouterLink>
   ```

## localStorage Keys

The modal uses these localStorage keys:

- `welcome_modal_last_shown` - Date string of last modal view
- `welcome_modal_version` - Current guidelines version user has seen

## Forcing Modal to Show (for testing)

### Method 1: Clear localStorage
```javascript
// In browser console
localStorage.removeItem('welcome_modal_last_shown')
localStorage.removeItem('welcome_modal_version')
location.reload()
```

### Method 2: Change Date
```javascript
// In browser console
localStorage.setItem('welcome_modal_last_shown', 'Mon Jan 01 2024')
location.reload()
```

### Method 3: Update Version
Edit `src/components/WelcomeModal.vue`:
```typescript
const GUIDELINES_VERSION = '1.1' // Changed from 1.0
```

## Customization

### Change Modal Behavior
In `WelcomeModal.vue`, you can modify:

```typescript
// Show every 3 days instead of daily
function checkAndShowModal() {
  const lastShown = localStorage.getItem('welcome_modal_last_shown')
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  if (!lastShown || new Date(lastShown) < threeDaysAgo) {
    showModal.value = true
  }
}
```

### Update Community Guidelines
1. Edit `src/views/CommunityGuidelinesView.vue`
2. Update `GUIDELINES_VERSION` in `src/components/WelcomeModal.vue`
3. Deploy - all users will see the updated modal on next visit

## Production Checklist

Before deploying to production:

- [ ] Test modal appears on first visit
- [ ] Verify checkbox requirement works
- [ ] Test modal doesn't appear on same-day revisit
- [ ] Confirm modal appears next day
- [ ] Test mobile responsiveness
- [ ] Verify Community Guidelines page loads
- [ ] Add link to Community Guidelines in footer/navigation
- [ ] Test version update mechanism
- [ ] Ensure modal z-index is higher than other elements
- [ ] Verify overlay doesn't close modal

## Troubleshooting

**Modal appears every page load:**
- Check localStorage is not being cleared
- Verify date comparison logic in `checkAndShowModal()`

**Modal never appears:**
- Check WelcomeModal is imported in App.vue
- Verify localStorage is enabled in browser
- Check browser console for errors

**Modal can be closed by clicking overlay:**
- Verify `handleOverlayClick()` returns without closing
- Check the `@click.self` directive on overlay

**Button stays enabled without checkbox:**
- Verify `v-model="agreedToGuidelines"` on checkbox
- Check `:disabled="!agreedToGuidelines"` on button

## Support Email

The Community Guidelines page includes a support email link:
`mailto:support@dont-shoot.com`

Make sure to monitor this email for user reports.

## Success! 🎉

Your Arc Raiders Bounty System now has:
- Professional welcome experience
- Clear community expectations
- Daily reminder of positive behavior
- Easy-to-access guidelines page
- Version control for guideline updates

Users will feel welcomed and understand the platform is about **fun, friendly competition** - not toxicity!
