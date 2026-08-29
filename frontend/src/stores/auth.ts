import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/core'
import type { User, LoginPayload, RegisterPayload, AuthTokens } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  // Actions
  async function login(payload: LoginPayload) {
    const { data } = await api.post<{ user: User } & AuthTokens>('/auth/login', payload)
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    user.value = data.user
  }

  async function register(payload: RegisterPayload) {
    const { data } = await api.post<{ user: User } & AuthTokens>('/auth/register', payload)
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    user.value = data.user
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) throw new Error('No refresh token')
    const { data } = await api.post<AuthTokens>('/auth/refresh', {
      refreshToken: refreshToken.value,
    })
    setTokens(data)
  }

  function setTokens(tokens: AuthTokens) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
  }
})
