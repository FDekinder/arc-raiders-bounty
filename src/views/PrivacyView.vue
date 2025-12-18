<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="privacy-card">
        <h1 class="title">Privacy Policy</h1>
        <p class="last-updated">Last Updated: December 18, 2025</p>

        <section class="section">
          <h2 class="section-title">Introduction</h2>
          <p class="section-text">
            Welcome to the Arc Raiders Bounty System ("we," "our," or "us"). This Privacy Policy explains how we collect, use, and protect your information when you use our service.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title">Information We Collect</h2>
          <h3 class="subsection-title">Account Information</h3>
          <p class="section-text">
            When you create an account, we collect:
          </p>
          <ul class="list">
            <li>Username and display name</li>
            <li>Email address (if using email authentication)</li>
            <li>Steam ID or Google account information (if using OAuth)</li>
            <li>Profile picture/avatar</li>
            <li>Game role and clan tag (optional)</li>
          </ul>

          <h3 class="subsection-title">Usage Data</h3>
          <p class="section-text">
            We automatically collect certain information when you use our service:
          </p>
          <ul class="list">
            <li>Bounty creation and claim activity</li>
            <li>Points earned and achievements unlocked</li>
            <li>Browser type and IP address</li>
            <li>Device information and operating system</li>
          </ul>
        </section>

        <section class="section">
          <h2 class="section-title">Advertising and Cookies</h2>

          <h3 class="subsection-title">Google AdSense</h3>
          <p class="section-text">
            We use Google AdSense to display advertisements on our service. Google AdSense uses cookies and similar technologies to:
          </p>
          <ul class="list">
            <li>Show you relevant ads based on your interests</li>
            <li>Measure ad performance and engagement</li>
            <li>Prevent the same ads from continuously appearing</li>
            <li>Detect and prevent ad fraud</li>
          </ul>

          <h3 class="subsection-title">Cookie Consent</h3>
          <p class="section-text">
            When you first visit our service, you'll see a cookie consent banner. You can:
          </p>
          <ul class="list">
            <li><strong>Accept All:</strong> Allow all cookies including advertising cookies</li>
            <li><strong>Reject:</strong> Disable advertising cookies (essential cookies for core functionality remain active)</li>
          </ul>
          <p class="section-text">
            You can change your cookie preferences at any time by clearing your browser's local storage and refreshing the page.
          </p>

          <h3 class="subsection-title">Premium Subscription</h3>
          <p class="section-text">
            Users with a premium subscription will not see any advertisements on our service.
          </p>

          <h3 class="subsection-title">Third-Party Advertising</h3>
          <p class="section-text">
            Google, as a third-party vendor, uses cookies to serve ads on our service. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our service and/or other sites on the Internet.
          </p>
          <p class="section-text">
            You may opt out of personalized advertising by visiting
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" class="link">Google Ads Settings</a>
            or
            <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" class="link">aboutads.info</a>.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title">How We Use Your Information</h2>
          <p class="section-text">We use your information to:</p>
          <ul class="list">
            <li>Provide and maintain our service</li>
            <li>Process bounty claims and verify evidence</li>
            <li>Calculate points and achievements</li>
            <li>Display leaderboards and user profiles</li>
            <li>Show relevant advertisements (if not premium)</li>
            <li>Communicate important updates</li>
            <li>Prevent fraud and abuse</li>
          </ul>
        </section>

        <section class="section">
          <h2 class="section-title">Data Sharing</h2>
          <p class="section-text">
            We do not sell your personal information. We may share data with:
          </p>
          <ul class="list">
            <li><strong>Google AdSense:</strong> For advertising purposes (subject to your cookie consent)</li>
            <li><strong>Supabase:</strong> Our database and authentication provider</li>
            <li><strong>Steam/Google:</strong> For OAuth authentication (only public profile information)</li>
          </ul>
        </section>

        <section class="section">
          <h2 class="section-title">Data Security</h2>
          <p class="section-text">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul class="list">
            <li>Encrypted connections (HTTPS/SSL)</li>
            <li>Secure authentication via OAuth 2.0</li>
            <li>Regular security audits</li>
            <li>Access controls and monitoring</li>
          </ul>
        </section>

        <section class="section">
          <h2 class="section-title">Your Rights</h2>
          <p class="section-text">You have the right to:</p>
          <ul class="list">
            <li>Access your personal data</li>
            <li>Request data deletion</li>
            <li>Update or correct your information</li>
            <li>Opt out of personalized advertising</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section class="section">
          <h2 class="section-title">Children's Privacy</h2>
          <p class="section-text">
            Our service is not intended for users under the age of 13. We do not knowingly collect information from children under 13.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title">Changes to This Policy</h2>
          <p class="section-text">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title">Contact Us</h2>
          <p class="section-text">
            If you have questions about this Privacy Policy or your data, please contact us through our community channels.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-transparent text-white;
}

.content-wrapper {
  @apply container mx-auto px-4 py-8 max-w-4xl;
}

.privacy-card {
  @apply bg-arc-card rounded-lg p-6 sm:p-8 shadow-xl;
}

.title {
  @apply text-3xl sm:text-4xl font-bold mb-2 text-gray-900;
}

.last-updated {
  @apply text-sm text-arc-brown mb-8 pb-4 border-b-2 border-arc-brown/20;
}

.section {
  @apply mb-8;
}

.section-title {
  @apply text-2xl font-bold mb-4 text-gray-900;
}

.subsection-title {
  @apply text-xl font-semibold mb-2 mt-4 text-arc-red;
}

.section-text {
  @apply text-gray-700 mb-3 leading-relaxed;
}

.list {
  @apply list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4;
}

.link {
  @apply text-arc-red hover:underline font-semibold;
}
</style>
