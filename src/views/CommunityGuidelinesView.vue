<template>
  <div class="guidelines-page">
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <h1 class="text-4xl font-bold mb-6 text-white">Community Guidelines</h1>

      <div class="content">
        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Our Mission</h2>
          <p class="text-gray-300 leading-relaxed">
            Don't Shoot is designed to create a fun, competitive environment for Arc Raiders players.
            We believe in fostering a positive gaming community where everyone can enjoy friendly
            competition without negativity or toxicity.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Core Values</h2>

          <div class="guideline-card">
            <h3>🎮 It's All in Good Fun</h3>
            <p>
              Bounties are meant to add excitement to gameplay and create memorable moments.
              They should never be used to cause stress, anxiety, or negative feelings toward other players.
            </p>
          </div>

          <div class="guideline-card">
            <h3>🤝 Respect Everyone</h3>
            <p>
              Every player deserves to be treated with kindness and dignity. Bullying, harassment,
              hate speech, discrimination, or toxic behavior of any kind will result in immediate
              account suspension or ban.
            </p>
          </div>

          <div class="guideline-card">
            <h3>🏆 Good Sportsmanship</h3>
            <p>
              Celebrate your victories and learn from defeats. Compliment good plays, accept
              bounties gracefully, and never gloat or put others down. We're all here to have fun.
            </p>
          </div>

          <div class="guideline-card">
            <h3>💚 Positive Competition</h3>
            <p>
              Use bounties to challenge friends and rivals in a friendly, constructive way.
              Avoid placing bounties with malicious intent or targeting specific players repeatedly
              to harass them.
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Prohibited Behavior</h2>
          <ul class="list-disc list-inside space-y-2 text-gray-300">
            <li>Bullying, harassment, or targeted attacks against any player</li>
            <li>Hate speech, discrimination, or offensive language</li>
            <li>Creating bounties with the intent to harass specific players</li>
            <li>Coordinating attacks or "witch hunts" against individuals</li>
            <li>Sharing personal information without consent</li>
            <li>Using the platform to settle real-life disputes</li>
            <li>Exploiting bugs or cheating the system</li>
            <li>Impersonating other users or admins</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Reporting Issues</h2>
          <p class="text-gray-300 leading-relaxed mb-4">
            If you experience or witness behavior that violates these guidelines, please report it
            immediately. We take all reports seriously and will investigate promptly.
          </p>
          <a href="mailto:support@dont-shoot.com" class="report-button">
            Report an Issue
          </a>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Consequences</h2>
          <p class="text-gray-300 leading-relaxed">
            Violations of these guidelines may result in:
          </p>
          <ul class="list-disc list-inside space-y-2 text-gray-300 mt-4">
            <li><strong>Warning:</strong> First-time minor offenses</li>
            <li><strong>Temporary Suspension:</strong> Repeated or moderate violations</li>
            <li><strong>Permanent Ban:</strong> Severe violations or repeated offenses</li>
          </ul>
        </section>

        <section>
          <div class="final-message">
            <Heart class="heart-icon" :size="32" />
            <h3>Let's Build Something Great Together</h3>
            <p>
              We're building more than just a bounty platform – we're creating a community.
              By treating each other with respect and keeping competition fun and friendly,
              we can make Don't Shoot an awesome place for all Arc Raiders players.
            </p>
            <p class="mt-4">
              <strong>Thank you for being part of our community! 💪</strong>
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Heart } from 'lucide-vue-next'
</script>

<style scoped>
.guidelines-page {
  min-height: 100vh;
  background: transparent;
  color: white;
}

.content {
  line-height: 1.8;
}

h1, h2, h3 {
  color: white;
}

.guideline-card {
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #ef4444;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.guideline-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
}

.guideline-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.report-button {
  display: inline-block;
  background: #ef4444;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.report-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.final-message {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.heart-icon {
  color: #ef4444;
  margin: 0 auto 16px;
}

.final-message h3 {
  font-size: 24px;
  margin-bottom: 16px;
  color: white;
}

.final-message p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* List styling */
ul {
  margin-left: 20px;
}

strong {
  color: white;
}
</style>
