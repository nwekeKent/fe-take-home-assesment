<template>
  <div
    class="flex flex-col w-full h-screen max-w-6xl mx-auto overflow-hidden bg-white shadow-lg rounded-2xl"
  >
    <!-- Header Section -->
    <div class="flex-shrink-0 p-6 border-b border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Battery Monitoring Table</h1>
          <p class="mt-1 text-gray-600">You can find your battery data information here.</p>
        </div>
      </div>

      <!-- Search Section -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          v-model="search"
          type="text"
          placeholder="Search by Employee ID"
          class="flex-1 max-w-sm px-4 py-2 text-black placeholder-gray-500 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div class="flex items-center gap-4">
          <button
            @click="clearSearch"
            class="px-6 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Clear
          </button>

          <!-- Rows per page dropdown -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 whitespace-nowrap">Show:</label>
            <select
              v-model.number="rowsPerPage"
              class="px-3 py-2 text-black bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span class="text-sm text-gray-600 whitespace-nowrap">entries</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <div class="flex flex-col flex-1 overflow-auto table-container">
        <!-- Header -->
        <div class="flex-shrink-0 border-b border-gray-200 bg-gray-50 lg:sticky lg:top-0 lg:z-10">
          <div
            class="grid grid-cols-5 border-gray-200 bg-gray-50 gap-4 px-6 py-4 text-sm font-medium text-gray-700 min-w-[800px]"
          >
            <div class="flex items-center gap-2">Employee ID</div>
            <div>Academy ID</div>
            <div>Serial Number</div>
            <div>Battery Level</div>
            <div>Timestamp</div>
          </div>
        </div>

        <!-- Table Body -->
        <div class="flex-1">
          <div v-if="loading" class="flex items-center h-100 justify-center p-12 min-w-[800px]">
            <div class="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <span class="ml-3 text-gray-600">Loading battery data...</span>
          </div>

          <div
            v-else-if="currentPageData.length === 0"
            class="p-12 text-center text-gray-500 min-w-[800px]"
          >
            <div class="mb-2 text-lg font-medium">No battery data found</div>
            <div class="text-sm">Try adjusting your search criteria</div>
          </div>

          <div v-else>
            <div
              v-for="(item, index) in currentPageData"
              :key="index"
              class="grid items-center grid-cols-5 gap-4 px-6 py-4 transition-colors border-b border-gray-100 hover:bg-gray-50 min-w-[800px]"
              :class="{ 'bg-gray-50/50': index % 2 === 1 }"
            >
              <!-- Employee ID -->
              <div class="font-mono font-medium text-blue-600">
                {{ item.employeeId }}
              </div>

              <!-- Academy ID -->
              <div class="text-gray-700">
                {{ item.academyId }}
              </div>

              <!-- Serial Number -->
              <div class="font-mono text-sm text-gray-600">
                {{ item.serialNumber }}
              </div>

              <!-- Battery Level -->
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    class="h-full transition-all duration-300 rounded-full"
                    :class="getBatteryColor(item.batteryLevel)"
                    :style="{ width: item.batteryLevel * 100 + '%' }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-700 min-w-[3rem]">
                  {{ (item.batteryLevel * 100).toFixed(0) }}%
                </span>
              </div>

              <!-- Timestamp -->
              <div class="text-sm text-gray-600">
                {{ formatDate(item.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Section -->
    <div class="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-gray-600">
          Showing {{ startRecord }} to {{ endRecord }} of {{ filteredData.length }} entries
          <span v-if="debouncedSearch" class="ml-2 text-blue-600"
            >(filtered from {{ data.length }} total)</span
          >
        </div>

        <div class="flex items-center justify-center gap-2 sm:justify-end">
          <!-- Previous Button -->
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm text-gray-700 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <!-- Page Numbers -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="px-3 py-2 text-sm transition-colors border rounded-lg"
            :class="
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            "
          >
            {{ page }}
          </button>

          <!-- Next Button -->
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm text-gray-700 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import batteryData, { type BatteryRecord } from '../data/batteryData';

const loading = ref(true);
const search = ref('');
const debouncedSearch = ref('');
const rowsPerPage = ref(10);
const currentPage = ref(1);
const data = ref<BatteryRecord[]>([]);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

// Debounce timer
let debounceTimer: NodeJS.Timeout | null = null;

const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    data.value = batteryData as BatteryRecord[];
    loading.value = false;
  }, 1500);
};

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  fetchData();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }
});

// Cleanup resize listener
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
});

// Debounced search functionality
watch(search, (newValue) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debouncedSearch.value = newValue;
    currentPage.value = 1; // Reset to first page when search changes
  }, 300); // 300ms debounce delay
});

// Watch for rows per page changes and reset to first page
watch(rowsPerPage, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!debouncedSearch.value.trim()) return data.value;
  const searchTerm = debouncedSearch.value.toLowerCase().trim();
  return data.value.filter((item) => item.employeeId.toLowerCase().includes(searchTerm));
});

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / Number(rowsPerPage.value));
});

const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * Number(rowsPerPage.value);
  const end = start + Number(rowsPerPage.value);
  return filteredData.value.slice(start, end);
});

const startRecord = computed(() => {
  if (filteredData.value.length === 0) return 0;
  return (currentPage.value - 1) * Number(rowsPerPage.value) + 1;
});

const endRecord = computed(() => {
  const end = currentPage.value * Number(rowsPerPage.value);
  return Math.min(end, filteredData.value.length);
});

const visiblePages = computed(() => {
  const pages = [];
  // Use 2 pages on mobile (< 640px), 5 pages on larger screens
  const maxVisible = windowWidth.value < 640 ? 2 : 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function clearSearch() {
  search.value = '';
  debouncedSearch.value = '';
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
}

function getBatteryColor(level: number): string {
  if (level > 0.6) return 'bg-green-500';
  if (level > 0.3) return 'bg-orange-500';
  return 'bg-red-500';
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
</script>

<style scoped>
/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 6px;
  height: 0px; /* Hide horizontal scrollbar */
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Hide scrollbar for Firefox */
.table-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

/* Hide scrollbar for WebKit browsers */
.table-container::-webkit-scrollbar {
  display: none;
}
</style>
