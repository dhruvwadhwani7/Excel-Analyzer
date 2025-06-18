import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Chart from 'chart.js/auto';
import * as THREE from 'three';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaSpinner } from 'react-icons/fa';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { getChartConfig } from '../utils/chartUtils';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [dimension, setDimension] = useState('2d');
  const [chartTitle, setChartTitle] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [zAxis, setZAxis] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [chart, setChart] = useState(null);
  const [hoveredLabel, setHoveredLabel] = useState(null);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const labelRendererRef = useRef(null);
  const tooltipRef = useRef(null);

  // Add authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('userToken');
      if (!token || !user) {
        navigate('/login');
        return;
      }
      setPageLoading(false);
    };
    checkAuth();
  }, [user, navigate]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('userToken');
        const response = await fetch('https://excel-analyzer-1.onrender.com/api/files/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setFiles(data.files);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast.error('Error loading files');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFiles();
  }, [user]);

  const fetchFileData = async (fileId) => {
    try {
      const token = sessionStorage.getItem('userToken');
      const response = await fetch(`https://excel-analyzer-1.onrender.com/api/files/${fileId}/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFileData(data.data);
      }
    } catch (error) {
      console.error('Error fetching file data:', error);
      toast.error('Error loading file data');
    }
  };

  const handleFileChange = async (e) => {
    const fileId = e.target.value;
    setSelectedFile(fileId);
    if (fileId) {
      setLoading(true);
      await fetchFileData(fileId);
      setLoading(false);
    }
  };

  const getChartTypes = () => {
    if (dimension === '2d') {
      return (
        <>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="area">Area Chart</option>
          <option value="pie">Pie Chart</option>
        </>
      );
    } else {
      return (
        <>
          <option value="column3d">3D Column Chart</option>
          <option value="bar3d">3D Bar Chart (Horizontal)</option>
          <option value="line3d">3D Line Chart</option>
          <option value="scatter3d">3D Scatter Plot</option>
          <option value="area3d">3D Area Chart</option>
        </>
      );
    }
  };

  const setupBasic3DScene = (width, height) => {
    // Clear previous scene
    if (rendererRef.current) {
      rendererRef.current.dispose();
      chartRef.current.innerHTML = '';
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(20, 20, 20);

    // Main renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    chartRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    chartRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    scene.add(ambientLight, dirLight);

    return { scene, camera, renderer, controls, labelRenderer };
  };

  // Modify the create3DAxisLabels function
  const create3DAxisLabels = (scene, size, labels) => {
    const { xLabel, yLabel, zLabel } = labels;
    const axisLength = size;

    // Create colored planes
    const planeSize = size * 2;
    const planeMaterial = (color) => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // XY Plane (Blue)
    const xyPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(planeSize, planeSize),
      planeMaterial(0x0044ff)
    );
    xyPlane.position.set(planeSize/4, planeSize/4, 0);
    scene.add(xyPlane);

    // XZ Plane (Red)
    const xzPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(planeSize, planeSize),
      planeMaterial(0xff4444)
    );
    xzPlane.rotation.x = Math.PI / 2;
    xzPlane.position.set(planeSize/4, 0, planeSize/4);
    scene.add(xzPlane);

    // YZ Plane (Green)
    const yzPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(planeSize, planeSize),
      planeMaterial(0x44ff44)
    );
    yzPlane.rotation.y = Math.PI / 2;
    yzPlane.position.set(0, planeSize/4, planeSize/4);
    scene.add(yzPlane);

    // Create axis labels with enhanced visibility
    const createAxisLabel = (text, position, color) => {
      const div = document.createElement('div');
      div.className = 'px-3 py-2 rounded-lg text-sm font-bold shadow-lg';
      div.style.backgroundColor = color;
      div.style.color = 'white';
      div.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
      div.style.whiteSpace = 'nowrap';
      div.style.pointerEvents = 'none';
      div.textContent = text;
      const label = new CSS2DObject(div);
      label.position.copy(position);
      return label;
    };

    // Add enhanced axis labels with better colors
    scene.add(createAxisLabel(
      `${xLabel}`,
      new THREE.Vector3(axisLength + 2, 0, 0),
      'rgba(190, 24, 93, 0.9)' // Pink
    ));
    
    scene.add(createAxisLabel(
      `${yLabel}`,
      new THREE.Vector3(0, axisLength + 2, 0),
      'rgba(59, 130, 246, 0.9)' // Blue
    ));

    if (zLabel) {
      scene.add(createAxisLabel(
        `${zLabel}`,
        new THREE.Vector3(0, 0, axisLength + 2),
        'rgba(16, 185, 129, 0.9)' // Green
      ));
    }

    // Add grid with enhanced visibility
    const gridColor = 0x666666;
    const gridHelperXY = new THREE.GridHelper(size, 10, gridColor, gridColor);
    gridHelperXY.material.opacity = 0.2;
    gridHelperXY.material.transparent = true;
    scene.add(gridHelperXY);

    if (zLabel) {
      const gridHelperXZ = new THREE.GridHelper(size, 10, gridColor, gridColor);
      gridHelperXZ.rotation.x = Math.PI / 2;
      gridHelperXZ.material.opacity = 0.2;
      gridHelperXZ.material.transparent = true;
      scene.add(gridHelperXZ);

      const gridHelperYZ = new THREE.GridHelper(size, 10, gridColor, gridColor);
      gridHelperYZ.rotation.z = Math.PI / 2;
      gridHelperYZ.material.opacity = 0.2;
      gridHelperYZ.material.transparent = true;
      scene.add(gridHelperYZ);
    }

    // Add axes with enhanced visibility
    const axes = new THREE.AxesHelper(axisLength);
    axes.material.linewidth = 2;
    scene.add(axes);
  };

  // Add this new function for 2D charts
  const setupChartTooltip = useCallback(() => {
    const tooltipHandler = function(context) {
      const tooltipEl = tooltipRef.current;
      if (!tooltipEl) return;

      if (context.tooltip.opacity === 0) {
        tooltipEl.style.display = 'none';
        return;
      }

      const position = context.chart.canvas.getBoundingClientRect();
      if (context.tooltip.body) {
        const bodyLines = context.tooltip.body.map(b => b.lines);
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = position.left + context.tooltip.caretX + 'px';
        tooltipEl.style.top = position.top + context.tooltip.caretY + 'px';
        setHoveredLabel(bodyLines.flat().join('\n'));
      }
    };

    return {
      plugins: {
        tooltip: {
          enabled: false,
          external: tooltipHandler
        }
      }
    };
  }, []);

  // Modify the createDataLabel function
  const createDataLabel = (text, position) => {
    const div = document.createElement('div');
    div.className = 'bg-[#be185d] text-white px-2 py-1 rounded text-sm opacity-0 transition-opacity duration-200';
    div.textContent = text;
    const label = new CSS2DObject(div);
    label.position.set(position.x, position.y, position.z);
    return { label, element: div };
  };

  const generate3DColumnChart = (data) => {
    const width = chartRef.current.clientWidth;
    const height = 400;
    const { scene, camera, renderer, controls, labelRenderer } = setupBasic3DScene(width, height);

    // Add axis labels
    create3DAxisLabels(scene, 20, {
      xLabel: xAxis,
      yLabel: yAxis,
      zLabel: dimension === '3d' && zAxis ? zAxis : null
    });

    // Scale data for all dimensions
    const maxY = Math.max(...data.map(d => parseFloat(d.y) || 0));
    const maxZ = Math.max(...data.map(d => parseFloat(d.z) || 0));
    const scaleY = 15 / maxY;
    const scaleZ = zAxis ? (15 / maxZ) : 1;

    // Create columns with labels
    data.forEach((point, i) => {
      const yValue = parseFloat(point.y) || 0;
      const zValue = parseFloat(point.z) || 0;
      const height = yValue * scaleY;
      
      const geometry = new THREE.BoxGeometry(1, height, 1);
      const material = new THREE.MeshPhongMaterial({
        color: 0xbe185d,
        shininess: 100,
        specular: 0x666666
      });

      const column = new THREE.Mesh(geometry, material);
      const xPos = i * 2 - (data.length * 2) / 2;
      const zPos = zAxis ? (zValue * scaleZ) : 0;
      
      column.position.set(xPos, height/2, zPos);
      
      // Add hover label with Z value if present
      const labelText = zAxis 
        ? `${point.x}: Y=${yValue.toFixed(1)}, Z=${zValue.toFixed(1)}`
        : `${point.x}: ${yValue.toFixed(1)}`;

      const { label, element } = createDataLabel(
        labelText,
        { x: xPos, y: height + 0.5, z: zPos }
      );
      
      column.userData = { label: element };
      
      // Add hover events
      column.addEventListener('mouseover', () => {
        if (column.userData.label) {
          column.userData.label.style.opacity = '1';
        }
      });
      
      column.addEventListener('mouseout', () => {
        if (column.userData.label) {
          column.userData.label.style.opacity = '0';
        }
      });

      scene.add(column);
      scene.add(label);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = chartRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
      labelRenderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  const generate3DBarChart = (data) => {
    const width = chartRef.current.clientWidth;
    const height = 400;
    const { scene, camera, renderer, controls, labelRenderer } = setupBasic3DScene(width, height);

    // Add axis labels before returning
    create3DAxisLabels(scene, 20, {
      xLabel: xAxis,
      yLabel: yAxis,
      zLabel: dimension === '3d' && zAxis ? zAxis : null
    });

    const maxY = Math.max(...data.map(d => parseFloat(d.y) || 0));
    const maxZ = Math.max(...data.map(d => parseFloat(d.z) || 0));
    const scaleY = 15 / maxY;
    const scaleZ = zAxis ? (15 / maxZ) : 1;

    data.forEach((point, i) => {
      const value = parseFloat(point.y) || 0;
      const zValue = parseFloat(point.z) || 0;
      const width = value * scaleY;
      
      const geometry = new THREE.BoxGeometry(width, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: 0xbe185d,
        shininess: 100,
      });

      const bar = new THREE.Mesh(geometry, material);
      const yPos = i * 2 - (data.length * 2) / 2;
      const zPos = zAxis ? (zValue * scaleZ) : 0;
      
      bar.position.set(width/2, yPos, zPos);

      const labelText = zAxis 
        ? `${point.x}: Y=${value.toFixed(1)}, Z=${zValue.toFixed(1)}`
        : `${point.x}: ${value.toFixed(1)}`;

      const { label, element } = createDataLabel(
        labelText,
        { x: width + 0.5, y: yPos, z: zPos }
      );
      
      bar.userData = { label: element };
      
      // Add hover events
      bar.addEventListener('mouseover', () => {
        if (bar.userData.label) {
          bar.userData.label.style.opacity = '1';
        }
      });
      
      bar.addEventListener('mouseout', () => {
        if (bar.userData.label) {
          bar.userData.label.style.opacity = '0';
        }
      });

      scene.add(bar);
      scene.add(label);
    });

    camera.position.set(20, 0, 20);
    
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();
  };

  const generate3DLineChart = (data) => {
    const width = chartRef.current.clientWidth;
    const height = 400;
    const { scene, camera, renderer, controls, labelRenderer } = setupBasic3DScene(width, height);

    create3DAxisLabels(scene, 20, {
      xLabel: xAxis,
      yLabel: yAxis,
      zLabel: dimension === '3d' && zAxis ? zAxis : null
    });

    const maxY = Math.max(...data.map(d => parseFloat(d.y) || 0));
    const maxZ = Math.max(...data.map(d => parseFloat(d.z) || 0));
    const scaleY = 15 / maxY;
    const scaleZ = zAxis ? (15 / maxZ) : 1;

    // Create line geometry with Z coordinates
    const points = data.map((point, i) => {
      const yValue = parseFloat(point.y) || 0;
      const zValue = parseFloat(point.z) || 0;
      return new THREE.Vector3(
        i * 2 - (data.length * 2) / 2,
        yValue * scaleY,
        zValue * scaleZ
      );
    });

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xbe185d });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Add points and labels with Z values
    points.forEach((point, i) => {
      const sphereGeometry = new THREE.SphereGeometry(0.3);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xbe185d });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(point);

      const labelText = zAxis 
        ? `${data[i].x}: Y=${data[i].y}, Z=${data[i].z}`
        : `${data[i].x}: ${data[i].y}`;

      const { label, element } = createDataLabel(
        labelText,
        { x: point.x, y: point.y + 0.5, z: point.z }
      );

      sphere.userData = { label: element };
      
      sphere.addEventListener('mouseover', () => {
        if (sphere.userData.label) {
          sphere.userData.label.style.opacity = '1';
        }
      });
      
      sphere.addEventListener('mouseout', () => {
        if (sphere.userData.label) {
          sphere.userData.label.style.opacity = '0';
        }
      });

      scene.add(sphere);
      scene.add(label);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();
  };

  const generate3DAreaChart = (data) => {
    const width = chartRef.current.clientWidth;
    const height = 400;
    const { scene, camera, renderer, controls, labelRenderer } = setupBasic3DScene(width, height);

    create3DAxisLabels(scene, 20, {
      xLabel: xAxis,
      yLabel: yAxis,
      zLabel: dimension === '3d' && zAxis ? zAxis : null
    });

    const maxY = Math.max(...data.map(d => parseFloat(d.y) || 0));
    const maxZ = Math.max(...data.map(d => parseFloat(d.z) || 0));
    const scaleY = 15 / maxY;
    const scaleZ = zAxis ? (15 / maxZ) : 1;

    // Create points for the area
    const points = data.map((point, i) => {
      const yValue = parseFloat(point.y) || 0;
      const zValue = parseFloat(point.z) || 0;
      return new THREE.Vector3(
        i * 2 - (data.length * 2) / 2,
        yValue * scaleY,
        zValue * scaleZ
      );
    });

    // Create bottom points to close the shape
    const bottomPoints = data.map((point, i) => {
      return new THREE.Vector3(
        i * 2 - (data.length * 2) / 2,
        0,
        zAxis ? (parseFloat(point.z) || 0) * scaleZ : 0
      );
    });

    // Remove the unused shape creation
    const areaGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const color = new THREE.Color(0xbe185d);
    const bottomColor = new THREE.Color(0x4a0726);

    // Add vertices for the area (triangles)
    for (let i = 0; i < points.length - 1; i++) {
      // Top triangle
      vertices.push(
        points[i].x, points[i].y, points[i].z,
        points[i + 1].x, points[i + 1].y, points[i + 1].z,
        bottomPoints[i].x, bottomPoints[i].y, bottomPoints[i].z,
      );

      // Bottom triangle
      vertices.push(
        points[i + 1].x, points[i + 1].y, points[i + 1].z,
        bottomPoints[i + 1].x, bottomPoints[i + 1].y, bottomPoints[i + 1].z,
        bottomPoints[i].x, bottomPoints[i].y, bottomPoints[i].z,
      );

      // Add colors for each vertex
      for (let j = 0; j < 3; j++) {
        color.toArray(colors, colors.length);
      }
      for (let j = 0; j < 3; j++) {
        bottomColor.toArray(colors, colors.length);
      }
    }

    areaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    areaGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const areaMaterial = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      shininess: 50
    });

    const areaMesh = new THREE.Mesh(areaGeometry, areaMaterial);
    scene.add(areaMesh);

    // Add line on top of the area
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xbe185d, linewidth: 2 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Add points and labels
    points.forEach((point, i) => {
      const sphereGeometry = new THREE.SphereGeometry(0.3);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xbe185d });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(point);

      const labelText = zAxis 
        ? `${data[i].x}: Y=${data[i].y}, Z=${data[i].z}`
        : `${data[i].x}: ${data[i].y}`;

      const { label, element } = createDataLabel(
        labelText,
        { x: point.x, y: point.y + 0.5, z: point.z }
      );

      sphere.userData = { label: element };
      
      sphere.addEventListener('mouseover', () => {
        if (sphere.userData.label) {
          sphere.userData.label.style.opacity = '1';
        }
      });
      
      sphere.addEventListener('mouseout', () => {
        if (sphere.userData.label) {
          sphere.userData.label.style.opacity = '0';
        }
      });

      scene.add(sphere);
      scene.add(label);
    });

    // Adjust camera position for better view
    camera.position.set(25, 15, 25);
    controls.update();

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();
  };

  // Update the generate3DChart function
  const generate3DChart = useCallback((data) => {
    switch (chartType) {
      case 'column3d':
        return generate3DColumnChart(data);
      case 'bar3d':
        return generate3DBarChart(data);
      case 'line3d':
        return generate3DLineChart(data);
      case 'scatter3d':
        return generate3DColumnChart(data);
      case 'area3d':
        return generate3DAreaChart(data); // Now using the proper area chart
      default:
        return generate3DColumnChart(data);
    }
  }, [chartType]);

  const generateChart = useCallback(() => {
    if (!fileData || !chartType || !xAxis || !yAxis) return;

    const data = fileData.rows.map(row => ({
      x: row[xAxis],
      y: row[yAxis],
      ...(dimension === '3d' && zAxis ? { z: row[zAxis] } : {})
    }));

    if (dimension === '2d') {
      const ctx = canvasRef.current.getContext('2d');
      if (chart) chart.destroy();

      // Use setupChartTooltip in the chart configuration
      const chartConfig = getChartConfig(
        chartType,
        data,
        chartTitle,
        xAxis,
        yAxis,
        setupChartTooltip()  // Actually use the tooltip setup
      );

      const newChart = new Chart(ctx, chartConfig);
      setChart(newChart);
    } else {
      generate3DChart(data);
    }
  }, [fileData, chartType, dimension, xAxis, yAxis, zAxis, chartTitle, chart, generate3DChart, setupChartTooltip]); // Add setupChartTooltip to dependencies

  // Update saveChart function
  const saveChart = async () => {
    try {
      if (!fileData || !chartType || !xAxis || !yAxis) {
        toast.error('Please select all required chart parameters');
        return null;
      }

      // Format chart data properly
      const chartData = fileData.rows.map(row => ({
        x: row[xAxis]?.toString() || '',
        y: parseFloat(row[yAxis]) || 0,
        ...(dimension === '3d' && zAxis ? { z: parseFloat(row[zAxis]) || 0 } : {})
      })).filter(d => d.x && !isNaN(d.y));

      if (chartData.length === 0) {
        toast.error('No valid data points found');
        return null;
      }

      // Get chart image
      let chartImage;
      try {
        if (dimension === '2d' && canvasRef.current) {
          chartImage = canvasRef.current.toDataURL('image/jpeg', 0.7);
        } else if (chartRef.current) {
          const canvas = await html2canvas(chartRef.current);
          chartImage = canvas.toDataURL('image/jpeg', 0.7);
        } else {
          throw new Error('Chart element not found');
        }
      } catch (e) {
        console.error('Error capturing chart image:', e);
        toast.error('Failed to capture chart image');
        return null;
      }

      const payload = {
        fileId: selectedFile,
        chartType,
        title: chartTitle || 'Untitled Chart',
        data: chartData,
        xAxis,
        yAxis,
        zAxis: dimension === '3d' ? zAxis : undefined,
        dimension,
        dataPreview: fileData?.preview?.slice(0, 10) || [],
        image: chartImage,
        chartConfig: {
          chartType,
          dimension,
          xAxis,
          yAxis,
          zAxis,
          title: chartTitle
        }
      };

      console.log('Saving chart with data length:', chartData.length); // Debug log

      const token = sessionStorage.getItem('userToken');
      const response = await fetch('https://excel-analyzer-1.onrender.com/api/chart/save-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save chart');
      }

      const result = await response.json();
      toast.success('Chart saved successfully');
      return result;

    } catch (error) {
      console.error('Chart save error:', error);
      toast.error(error.message || 'Error saving chart configuration');
      return null;
    }
  };

  // Update handleChartSave function
  const handleChartSave = async () => {
    try {
      const result = await saveChart();
      if (result && result.success) {
        toast.success('Chart configuration saved', {
          autoClose: 3000
        });

        toast.info('Chart will be automatically deleted after 12 hours from creation time', {
          autoClose: 5000
        });

        if (result.chart?._id) {
          await checkChartExpiry(result.chart._id);
        }
      }
    } catch (error) {
      console.error('Error handling chart save:', error);
      toast.error('Failed to save chart');
    }
  };

  const checkChartExpiry = async (chartId) => {
    try {
      const token = sessionStorage.getItem('userToken');
      const response = await fetch(`https://excel-analyzer-1.onrender.com/api/charts/${chartId}/expiry`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const { remainingTime, isExpired } = data.data;
        if (isExpired) {
          toast.warning('This chart has expired and will be deleted soon');
        } else {
          const hoursRemaining = Math.floor(remainingTime / (1000 * 60 * 60));
          const minutesRemaining = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
          toast.info(`Chart expires in ${hoursRemaining}h ${minutesRemaining}m`);
        }
      }
    } catch (error) {
      console.error('Error checking chart expiry:', error);
    }
  };

  const downloadAsPNG = () => {
    if (dimension === '2d') {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chartTitle || 'chart'}.png`;
      link.href = url;
      link.click();
    } else {
      html2canvas(chartRef.current).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${chartTitle || 'chart'}.png`;
        link.href = url;
        link.click();
      });
    }
  };

  const downloadAsPDF = () => {
    const element = dimension === '2d' ? canvasRef.current : chartRef.current;
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${chartTitle || 'chart'}.pdf`);
    });
  };

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-[#0f172a]/50 flex items-center justify-center rounded-lg">
      <FaSpinner className="text-4xl text-[#be185d] animate-spin" />
    </div>
  );

  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (labelRendererRef.current) {
        labelRendererRef.current.dispose();
        labelRendererRef.current = null;
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
  }, []);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <FaSpinner className="text-4xl text-[#be185d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#0f172a] rounded-xl p-6 mb-8 relative">
        {loading && <LoadingOverlay />}
        
        <h1 className="text-2xl font-bold text-white mb-6">Data Analytics</h1>
        

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Select File</label>
              <select
                className="w-full bg-[#1e293b] text-white rounded-lg p-2"
                onChange={handleFileChange}
                value={selectedFile || ''}
              >
                <option value="">Select a file</option>
                {files.map(file => (
                  <option key={file._id} value={file._id}>{file.fileName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Chart Type</label>
              <div className="flex gap-4 mb-4">
                <label className="text-white">
                  <input
                    type="radio"
                    name="dimension"
                    value="2d"
                    checked={dimension === '2d'}
                    onChange={(e) => setDimension(e.target.value)}
                    className="mr-2"
                  />
                  2D
                </label>
                <label className="text-white">
                  <input
                    type="radio"
                    name="dimension"
                    value="3d"
                    checked={dimension === '3d'}
                    onChange={(e) => setDimension(e.target.value)}
                    className="mr-2"
                  />
                  3D
                </label>
              </div>
              <select
                className="w-full bg-[#1e293b] text-white rounded-lg p-2"
                onChange={(e) => setChartType(e.target.value)}
                value={chartType}
              >
                {getChartTypes()}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Chart Title</label>
              <input
                type="text"
                className="w-full bg-[#1e293b] text-white rounded-lg p-2"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">X Axis</label>
              <select
                className="w-full bg-[#1e293b] text-white rounded-lg p-2"
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
              >
                <option value="">Select X Axis</option>
                {fileData?.columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Y Axis</label>
              <select
                className="w-full bg-[#1e293b] text-white rounded-lg p-2"
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
              >
                <option value="">Select Y Axis</option>
                {fileData?.columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {dimension === '3d' && (
              <div>
                <label className="block text-white mb-2">Z Axis</label>
                <select
                  className="w-full bg-[#1e293b] text-white rounded-lg p-2"
                  value={zAxis}
                  onChange={(e) => setZAxis(e.target.value)}
                >
                  <option value="">Select Z Axis</option>
                  {fileData?.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
          <button
            onClick={generateChart}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-2 bg-[#be185d] text-white rounded-lg 
      ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#be185d]/90'}`}
          >
            {loading ? (
              <><FaSpinner className="inline mr-2 animate-spin" /> Processing...</>
            ) : (
              'Generate Chart'
            )}
          </button>

          <button
            onClick={downloadAsPNG}
            className="w-full sm:w-auto px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#1e293b]/80"
          >
            Download PNG
          </button>

          <button
            onClick={downloadAsPDF}
            className="w-full sm:w-auto px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#1e293b]/80"
          >
            Download PDF
          </button>

          <button
            onClick={handleChartSave}
            className="w-full sm:w-auto px-4 py-2 bg-[#be185d] text-white rounded-lg hover:bg-[#1e293b]/80"
          >
            Save Your Chart
          </button>
        </div>
        <div ref={chartRef} className="bg-[#1e293b] rounded-lg p-4 min-h-[400px] relative">
          {dimension === '2d' && <canvas ref={canvasRef}></canvas>}
          <div 
            ref={tooltipRef}
            className="absolute hidden bg-[#be185d] text-white px-2 py-1 rounded text-sm transform -translate-x-1/2 -translate-y-full pointer-events-none z-50"
            style={{ 
              zIndex: 1000,
              minWidth: '10px',
              textAlign: 'center',
              whiteSpace: 'pre-line'
            }}
          >
            {hoveredLabel}
          </div>
        </div>
      </div>
      {/* Add this notification message */}
        <div className="mb-6 text-yellow-400 bg-yellow-900/30 p-4 rounded-lg">
          <p>Important Notes:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Charts will be automatically deleted after 12 hours from their creation time</li>
            <li>This deletion occurs even if the source file remains in the database</li>
            <li>Please save or export important charts before they expire</li>
          </ul>
        </div>
    </div>
  );
};

export default Analytics;
