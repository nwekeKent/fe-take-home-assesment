import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock the TypeScript data import
vi.mock('../../data/batteryData', () => ({
  default: [
    {
      academyId: 1,
      batteryLevel: 0.85,
      employeeId: 'EMP001',
      serialNumber: 'SN001',
      timestamp: '2024-01-01T10:00:00Z'
    },
    {
      academyId: 2,
      batteryLevel: 0.45,
      employeeId: 'EMP002',
      serialNumber: 'SN002',
      timestamp: '2024-01-02T11:00:00Z'
    },
    {
      academyId: 3,
      batteryLevel: 0.15,
      employeeId: 'EMP003',
      serialNumber: 'SN003',
      timestamp: '2024-01-03T12:00:00Z'
    }
  ]
}));

import BatteryTable from '../BatteryTable.vue';

// Mock battery data for reference in tests
const mockBatteryData = [
  {
    academyId: 1,
    batteryLevel: 0.85,
    employeeId: 'EMP001',
    serialNumber: 'SN001',
    timestamp: '2024-01-01T10:00:00Z'
  },
  {
    academyId: 2,
    batteryLevel: 0.45,
    employeeId: 'EMP002',
    serialNumber: 'SN002',
    timestamp: '2024-01-02T11:00:00Z'
  },
  {
    academyId: 3,
    batteryLevel: 0.15,
    employeeId: 'EMP003',
    serialNumber: 'SN003',
    timestamp: '2024-01-03T12:00:00Z'
  }
];

describe('BatteryTable', () => {
  let wrapper: any;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(BatteryTable);
  });

  describe('Component Rendering', () => {
    it('renders the component with correct title', () => {
      expect(wrapper.find('h1').text()).toBe('Battery Monitoring Table');
    });

    it('renders the search input', () => {
      const searchInput = wrapper.find('input[placeholder="Search by Employee ID"]');
      expect(searchInput.exists()).toBe(true);
    });

    it('renders the rows per page dropdown', () => {
      const dropdown = wrapper.find('select');
      expect(dropdown.exists()).toBe(true);
      expect(dropdown.findAll('option')).toHaveLength(3);
    });

    it('renders clear button', () => {
      const buttons = wrapper.findAll('button');
      const clearButton = buttons.find((button) => button.text() === 'Clear');
      expect(clearButton).toBeTruthy();
    });
  });

  describe('Data Loading', () => {
    it('shows loading state initially', () => {
      expect(wrapper.find('.animate-spin').exists()).toBe(true);
      expect(wrapper.text()).toContain('Loading battery data...');
    });

    it('displays data after loading', async () => {
      // Wait for the loading timeout
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();

      expect(wrapper.find('.animate-spin').exists()).toBe(false);
      expect(wrapper.text()).toContain('EMP001');
      expect(wrapper.text()).toContain('EMP002');
      expect(wrapper.text()).toContain('EMP003');
    });
  });

  describe('Table Headers', () => {
    it('renders all table headers', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();

      const headers = wrapper.findAll('.text-sm.font-medium.text-gray-700 > div');
      expect(headers[0].text()).toContain('Employee ID');
      expect(headers[1].text()).toBe('Academy ID');
      expect(headers[2].text()).toBe('Serial Number');
      expect(headers[3].text()).toBe('Battery Level');
      expect(headers[4].text()).toBe('Timestamp');
    });
  });

  describe('Data Display', () => {
    beforeEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();
    });

    it('displays employee IDs correctly', () => {
      expect(wrapper.text()).toContain('EMP001');
      expect(wrapper.text()).toContain('EMP002');
      expect(wrapper.text()).toContain('EMP003');
    });

    it('displays academy IDs correctly', () => {
      expect(wrapper.text()).toContain('1');
      expect(wrapper.text()).toContain('2');
      expect(wrapper.text()).toContain('3');
    });

    it('displays serial numbers correctly', () => {
      expect(wrapper.text()).toContain('SN001');
      expect(wrapper.text()).toContain('SN002');
      expect(wrapper.text()).toContain('SN003');
    });

    it('displays battery percentages correctly', () => {
      expect(wrapper.text()).toContain('85%');
      expect(wrapper.text()).toContain('45%');
      expect(wrapper.text()).toContain('15%');
    });
  });

  describe('Battery Level Colors', () => {
    beforeEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();
    });

    it('applies correct color classes for different battery levels', () => {
      const batteryBars = wrapper.findAll('.h-full.transition-all.duration-300.rounded-full');

      // High battery (85%) should be green
      expect(batteryBars[0].classes()).toContain('bg-green-500');

      // Medium battery (45%) should be orange
      expect(batteryBars[1].classes()).toContain('bg-orange-500');

      // Low battery (15%) should be red
      expect(batteryBars[2].classes()).toContain('bg-red-500');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();
    });

    it('filters data based on employee ID search', async () => {
      const searchInput = wrapper.find('input[placeholder="Search by Employee ID"]');

      await searchInput.setValue('EMP001');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 350));
      await nextTick();

      expect(wrapper.text()).toContain('EMP001');
      expect(wrapper.text()).not.toContain('EMP002');
      expect(wrapper.text()).not.toContain('EMP003');
    });

    it('shows filtered count when searching', async () => {
      const searchInput = wrapper.find('input[placeholder="Search by Employee ID"]');

      await searchInput.setValue('EMP001');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 350));
      await nextTick();

      expect(wrapper.text()).toContain('(filtered from 3 total)');
    });

    it('clears search when clear button is clicked', async () => {
      const searchInput = wrapper.find('input[placeholder="Search by Employee ID"]');
      const buttons = wrapper.findAll('button');
      const clearButton = buttons.find((button) => button.text() === 'Clear');

      await searchInput.setValue('EMP001');
      await clearButton.trigger('click');
      await nextTick();

      expect(searchInput.element.value).toBe('');
    });

    it('shows no results message when search has no matches', async () => {
      const searchInput = wrapper.find('input[placeholder="Search by Employee ID"]');

      await searchInput.setValue('NONEXISTENT');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 350));
      await nextTick();

      expect(wrapper.text()).toContain('No battery data found');
      expect(wrapper.text()).toContain('Try adjusting your search criteria');
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();
    });

    it('shows correct pagination info', () => {
      expect(wrapper.text()).toContain('Showing 1 to 3 of 3 entries');
    });

    it('changes rows per page when dropdown value changes', async () => {
      const dropdown = wrapper.find('select');

      await dropdown.setValue('20');
      await nextTick();

      // Should still show all 3 entries since we only have 3 total
      expect(wrapper.text()).toContain('Showing 1 to 3 of 3 entries');
    });

    it('disables previous button on first page', () => {
      const buttons = wrapper.findAll('button');
      const prevButton = buttons.find((button) => button.text() === 'Previous');
      expect(prevButton.attributes('disabled')).toBeDefined();
    });

    it('disables next button when on last page', () => {
      const buttons = wrapper.findAll('button');
      const nextButton = buttons.find((button) => button.text() === 'Next');
      expect(nextButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Responsive Behavior', () => {
    it('handles window resize for pagination', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();

      // Simulate mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      // Trigger resize
      window.dispatchEvent(new Event('resize'));
      await nextTick();

      // The component should still render correctly
      expect(wrapper.find('h1').text()).toBe('Battery Monitoring Table');
    });
  });

  describe('Striped Rows', () => {
    beforeEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();
    });

    it('applies striped styling to even rows', () => {
      const rows = wrapper.findAll('.grid.items-center.grid-cols-5');

      // First row (index 0) should not have striped background
      expect(rows[0].classes()).not.toContain('bg-gray-50/50');

      // Second row (index 1) should have striped background
      expect(rows[1].classes()).toContain('bg-gray-50/50');

      // Third row (index 2) should not have striped background
      expect(rows[2].classes()).not.toContain('bg-gray-50/50');
    });
  });

  describe('Date Formatting', () => {
    beforeEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();
    });

    it('formats timestamps correctly', () => {
      // The mock data has timestamps that should be formatted as dates
      expect(wrapper.text()).toContain('Jan 1, 2024');
      expect(wrapper.text()).toContain('Jan 2, 2024');
      expect(wrapper.text()).toContain('Jan 3, 2024');
    });
  });

  describe('Debounced Search', () => {
    beforeEach(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await nextTick();
    });

    it('debounces search input', async () => {
      const searchInput = wrapper.find('input[placeholder="Search by Employee ID"]');

      // Type quickly
      await searchInput.setValue('E');
      await searchInput.setValue('EM');
      await searchInput.setValue('EMP');
      await searchInput.setValue('EMP001');

      // Should not filter immediately
      expect(wrapper.text()).toContain('EMP002');
      expect(wrapper.text()).toContain('EMP003');

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 350));
      await nextTick();

      // Now should be filtered
      expect(wrapper.text()).toContain('EMP001');
      expect(wrapper.text()).not.toContain('EMP002');
      expect(wrapper.text()).not.toContain('EMP003');
    });
  });
});
