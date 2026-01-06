<script setup lang="ts">
import { ref } from 'vue'
import { Bug } from 'lucide-vue-next'
</script>

<template>
  <div class="admin-bug-reports-tab">
    <div class="coming-soon">
      <Bug :size="64" />
      <h2>Bug Reports Management</h2>
      <p>Bug reports tab coming soon. For now, access via <a href="/admin/bug-reports">/admin/bug-reports</a></p>
    </div>
  </div>
</template>

<style scoped>
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
}

.coming-soon svg {
  color: rgba(255, 255, 255, 0.3);
}

.coming-soon h2 {
  font-size: 1.5rem;
  color: white;
  margin: 0;
}

.coming-soon p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
}

.coming-soon a {
  color: #dcca04ff;
  text-decoration: underline;
}

.coming-soon a:hover {
  color: #fff04d;
}
</style>
