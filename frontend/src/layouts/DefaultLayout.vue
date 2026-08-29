<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Customers', path: '/customers' },
  { name: 'Bookings', path: '/bookings' },
  { name: 'Tasks', path: '/tasks' },
  { name: 'Incidents', path: '/incidents' },
  { name: 'Notifications', path: '/notifications' },
]

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
      <div class="sidebar-header">
        <span v-if="!sidebarCollapsed">TeamOps</span>
        <button class="toggle-btn" @click="toggleSidebar">☰</button>
      </div>
      <nav>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: route.path === item.path }]"
        >
          <span v-if="!sidebarCollapsed">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="main">
      <header class="header">
        <div class="header-left"></div>
        <div class="header-right">
          <button class="btn-logout" @click="logout">Logout</button>
        </div>
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
  width: 240px;
  background: #1a1a2e;
  color: #fff;
  transition: width 0.2s;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #2a2a4a;
}

.toggle-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 18px;
}

nav {
  flex: 1;
  padding: 8px;
}

.nav-item {
  display: block;
  padding: 10px 12px;
  color: #ccc;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 4px;
}

.nav-item:hover,
.nav-item.active {
  background: #2a2a4a;
  color: #fff;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.btn-logout {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 24px;
}
</style>
