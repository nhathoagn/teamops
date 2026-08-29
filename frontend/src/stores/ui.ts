import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const currentOrgId = ref<string | null>(null)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setCurrentOrg(orgId: string) {
    currentOrgId.value = orgId
  }

  return {
    sidebarCollapsed,
    currentOrgId,
    toggleSidebar,
    setCurrentOrg,
  }
})
