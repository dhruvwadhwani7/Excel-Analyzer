const defaultChartConfig = {
  plugins: {
    tooltip: {
      enabled: true,
      external: null,  // Remove external handler to fix the call error
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y}`;
        }
      }
    },
    legend: {
      display: true,
      position: 'top'
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  }
};

export const getChartConfig = (type, data, options = {}) => {
  return {
    ...defaultChartConfig,
    type,
    data,
    options: {
      ...defaultChartConfig,
      ...options
    }
  };
};

export default defaultChartConfig;
