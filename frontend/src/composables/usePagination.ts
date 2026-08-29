import { ref, computed } from 'vue'

interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPageSize = 20 } = options

  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  function setPage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
    }
  }

  function setPageSize(newSize: number) {
    pageSize.value = newSize
    page.value = 1
  }

  function setTotal(newTotal: number) {
    total.value = newTotal
  }

  function nextPage() {
    if (hasNext.value) setPage(page.value + 1)
  }

  function prevPage() {
    if (hasPrev.value) setPage(page.value - 1)
  }

  function reset() {
    page.value = initialPage
    pageSize.value = initialPageSize
    total.value = 0
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    setPage,
    setPageSize,
    setTotal,
    nextPage,
    prevPage,
    reset,
  }
}
