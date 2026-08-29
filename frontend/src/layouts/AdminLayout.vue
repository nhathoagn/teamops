<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Reports', path: '/admin/reports' },
  { name: 'Invoices', path: '/admin/invoices' },
  { name: 'Audit Log', path: '/admin/audit-log' },
]

function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <span>Admin Panel</span>
      </div>
      <nav>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: route.path === item.path }]"
        >
          {{ item.name }}
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/dashboard" class="nav-item">← Back to App</router-link>
        <button class="nav-item logout-btn" @click="logout">Logout</button>
      </div>
    </aside>

    <div class="main">
      <header class="header">
        <h1>{{ route.name }}</h1>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #0f172a;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  font-weight: bold;
  border-bottom: 1px solid #1e293b;
}

nav {
  flex: 1;
  padding: 8px;
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid #1e293b;
}

.nav-item {
  display: block;
  padding: 10px 12px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 4px;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: inherit;
}

.nav-item:hover,
.nav-item.active {
  background: #1e293b;
  color: #fff;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
}

.header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 24px;
}
</style>
