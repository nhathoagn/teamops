import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/auth/LoginPage.vue'), // placeholder
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
      {
        path: 'bookings',
        name: 'Bookings',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
      {
        path: 'incidents',
        name: 'Incidents',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
      {
        path: 'invoices',
        name: 'AdminInvoices',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
      {
        path: 'audit-log',
        name: 'AdminAuditLog',
        component: () => import('@/pages/dashboard/DashboardPage.vue'), // placeholder
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard: redirect to /login if not authenticated
router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('accessToken')

  if (to.meta.requiresAuth !== false && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
