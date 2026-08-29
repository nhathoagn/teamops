<script setup lang="ts">
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p class="subtitle">Welcome to TeamOps</p>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Customers</h3>
        <p class="stat-value">--</p>
      </div>
      <div class="stat-card">
        <h3>Bookings</h3>
        <p class="stat-value">--</p>
      </div>
      <div class="stat-card">
        <h3>Active Tasks</h3>
        <p class="stat-value">--</p>
      </div>
      <div class="stat-card">
        <h3>Open Incidents</h3>
        <p class="stat-value">--</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard h1 {
  font-size: 24px;
  margin-bottom: 4px;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.stat-card h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}
</style>
