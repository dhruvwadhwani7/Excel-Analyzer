export const getColors = (count) => {
  const baseColors = [
    '#BE185D', // Primary pink
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1'  // Indigo
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors if needed
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
};

export const getChartConfig = (type, data, title, xLabel, yLabel, tooltipCallback) => {
  const isStacked = type === 'bar' || type === 'line';
  const colors = getColors(isStacked ? 1 : data.length);

  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#fff',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        enabled: false, // Disable default tooltip
        external: tooltipCallback, // Use custom tooltip
        mode: 'index',
        intersect: false,
        position: 'nearest'
      },
      title: {
        display: !!title,
        text: title,
        color: '#fff',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: { bottom: 20 }
      }
    },
    onHover: (event, elements, chart) => {
      const tooltipEl = chart.canvas.parentNode.querySelector('.chart-tooltip');
      if (elements && elements.length > 0) {
        const element = elements[0];
        if (tooltipEl) {
          tooltipEl.style.display = 'block';
          tooltipEl.style.left = `${event.native.clientX}px`;
          tooltipEl.style.top = `${event.native.clientY}px`;
          const dataPoint = data[element.index];
          tooltipEl.textContent = `${dataPoint.x}: ${dataPoint.y}`;
        }
      } else if (tooltipEl) {
        tooltipEl.style.display = 'none';
      }
    },
    scales: type !== 'pie' ? {
      x: {
        title: {
          display: true,
          text: xLabel,
          color: '#fff'
        },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        title: {
          display: true,
          text: yLabel,
          color: '#fff'
        },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    } : undefined
  };

  if (type === 'pie') {
    return {
      type,
      data: {
        labels: data.map(d => d.x),
        datasets: [{
          data: data.map(d => d.y),
          backgroundColor: colors,
          borderColor: 'rgba(15, 23, 42, 0.8)',
          borderWidth: 2
        }]
      },
      options: baseConfig
    };
  }

  // Add specific configurations for area charts
  if (type === 'area') {
    return {
      type: 'line', // We use line type but modify it for area
      data: {
        labels: data.map(d => d.x),
        datasets: [{
          label: title || yLabel,
          data: data.map(d => d.y),
          backgroundColor: 'rgba(190, 24, 93, 0.2)', // Semi-transparent primary color
          borderColor: '#be185d',
          tension: 0.4,
          fill: true, // This makes it an area chart
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#be185d',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
        }]
      },
      options: baseConfig
    };
  }

  return {
    type,
    data: {
      labels: data.map(d => d.x),
      datasets: [{
        label: title || yLabel,
        data: data.map(d => d.y),
        backgroundColor: colors[0],
        borderColor: colors[0],
        tension: type === 'line' ? 0.4 : 0,
        fill: type === 'line' ? false : undefined, // Explicitly set fill to false for line charts
        borderWidth: type === 'line' ? 2 : 1, // Add thicker border for line charts
        pointRadius: type === 'line' ? 4 : undefined, // Add visible points for line charts
        pointBackgroundColor: type === 'line' ? colors[0] : undefined,
        pointBorderColor: type === 'line' ? '#ffffff' : undefined,
        pointHoverRadius: type === 'line' ? 6 : undefined,
      }]
    },
    options: baseConfig
  };
};
