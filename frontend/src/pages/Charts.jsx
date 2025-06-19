import { useState, useEffect } from "react";
import {
  FaDownload,
  FaFilePdf,
  FaSpinner,
  FaSearch,
  FaCalendar,
} from "react-icons/fa";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "../styles/chartlayout.css";
import { useNavigate } from 'react-router-dom';

const Charts = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      const token = sessionStorage.getItem("userToken");
      const response = await fetch("https://excel-analyzer-1.onrender.com/api/charts/saved", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch charts");
      }

      const data = await response.json();
      if (data.success) {
        setCharts(data.charts);
      } else {
        throw new Error(data.message || "Failed to load charts");
      }
    } catch (error) {
      console.error("Error fetching charts:", error);
      toast.error(error.message || "Error loading charts");
    } finally {
      setLoading(false);
    }
  };

  const downloadChartPNG = async (chart) => {
    try {
      const link = document.createElement("a");
      link.href = chart.image;
      link.download = `${chart.title || "chart"}.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading chart:", error);
      toast.error("Error downloading chart");
    }
  };

  const downloadAllPDF = async () => {
    try {
      setDownloading(true);
      // Create PDF with better quality
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        hotfixes: ["px_scaling"],
      });

      const username =
        JSON.parse(sessionStorage.getItem("userData"))?.name || "User";

      // Add custom styling for the title page with white background
      pdf.setFillColor(255, 255, 255); // White background
      pdf.rect(
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
        "F"
      );

      // Title styling
      pdf.setTextColor(0, 0, 0); // Black text
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);

      // Center the title
      const title = `${username}'s Chart Analysis`;
      const titleWidth =
        (pdf.getStringUnitWidth(title) * pdf.internal.getFontSize()) /
        pdf.internal.scaleFactor;
      const titleX = (pdf.internal.pageSize.getWidth() - titleWidth) / 2;
      pdf.text(title, titleX, 30);

      // Add decorative line
      pdf.setDrawColor(190, 24, 93); // Pink line (#be185d)
      pdf.setLineWidth(0.5);
      pdf.line(20, 45, pdf.internal.pageSize.getWidth() - 20, 45);

      let chartCount = 0;
      let currentY = 30; // starting Y after title

      for (const chart of filteredCharts) {
        chartCount++;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = chart.image;

        await new Promise((resolve) => {
          img.onload = () => {
            const baseWidth = 1200;
            const aspectRatio = img.width / img.height;

            const canvasWidth = baseWidth;
            const canvasHeight = baseWidth / aspectRatio;

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // Draw chart image
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

            // Add white background behind chart
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.globalCompositeOperation = "source-over";

            const imgData = canvas.toDataURL("image/png");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 40;
            const imgHeight = (imgWidth * canvasHeight) / canvasWidth;

            // ❗ If chart doesn't fit on page, add new page
            if (currentY + imgHeight + 25 > pdfHeight - 20) {
              pdf.addPage();
              currentY = 30;
            }

            // Chart title
            const chartTitle = chart.title || "Untitled Chart";
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(chartTitle, 20, currentY + 6);

            currentY += 6;

            // Chart metadata
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);

            currentY += 5;

            // Chart image
            pdf.addImage(imgData, "PNG", 20, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 4;

            // Caption
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(9);
            pdf.setTextColor(80, 80, 80);
            const captionWidth =
              (pdf.getStringUnitWidth(chartTitle) * pdf.getFontSize()) /
              pdf.internal.scaleFactor;
            const captionX = (pdfWidth - captionWidth) / 2;
            pdf.text(chartTitle, captionX, currentY);
            currentY += 8;

            // Divider
            pdf.setDrawColor(190, 24, 93);
            pdf.setLineWidth(0.2);
            pdf.line(20, currentY, pdfWidth - 20, currentY);
            currentY += 10;

            resolve();
          };
        });
      }

      pdf.save("chart-analysis.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF");
    } finally {
      setDownloading(false);
    }
  };

  const filteredCharts = charts.filter((chart) => {
    const matchesSearch =
      chart.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.chartType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!dateRange.from && !dateRange.to) return matchesSearch;

    const chartDate = new Date(chart.createdAt);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;

    return (
      matchesSearch &&
      (!fromDate || chartDate >= fromDate) &&
      (!toDate || chartDate <= toDate)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="text-4xl text-[#be185d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#0f172a] rounded-xl p-6 mb-8">
                  <h1 className="text-2xl font-bold text-white mb-6"> Saved Charts</h1>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

 <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-start">
  {/* Search Input */}
  <div className="relative">
    <input
      type="text"
      placeholder="Search charts..."
      className="bg-[#1e293b] text-white rounded-lg pl-10 pr-4 py-2 w-full"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <FaSearch className="absolute left-3 top-3 text-gray-400" />
  </div>

  {/* From Date */}
  <div className="relative">
    <input
      type="date"
      className="bg-[#1e293b] text-white rounded-lg pl-10 pr-4 py-2 w-full"
      value={dateRange.from}
      onChange={(e) =>
        setDateRange((prev) => ({ ...prev, from: e.target.value }))
      }
    />
    <FaCalendar className="absolute left-3 top-3 text-gray-400" />
    <span className="text-xs text-gray-400 mt-1 ml-1">From</span>
  </div>

  {/* To Date */}
  <div className="relative">
    <input
      type="date"
      className="bg-[#1e293b] text-white rounded-lg pl-10 pr-4 py-2 w-full"
      value={dateRange.to}
      onChange={(e) =>
        setDateRange((prev) => ({ ...prev, to: e.target.value }))
      }
    />
    <FaCalendar className="absolute left-3 top-3 text-gray-400" />
    <span className="text-xs text-gray-400 mt-1 ml-1">To</span>
  </div>

  {/* Reset Button */}
  <button
    onClick={() => {
      setSearchTerm("");
      setDateRange({ from: "", to: "" });
    }}
    className="h-10 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 w-full"
  >
    Reset
  </button>

  {/* Download Button */}
  <button
    onClick={downloadAllPDF}
    disabled={downloading || filteredCharts.length === 0}
    className={`h-10 flex items-center justify-center gap-2 px-4 py-2 bg-[#be185d] text-white rounded-lg w-full
      ${
        downloading || filteredCharts.length === 0
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-[#be185d]/90"
      }`}
  >
    {downloading ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
    Download All as PDF
  </button>
</div>



        </div>

        {filteredCharts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No charts found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharts.map((chart) => (
              <div
                key={chart._id}
                className="bg-[#1e293b] rounded-lg p-4 hover:bg-[#1e293b]/80 transition-all"
              >
                <div className="aspect-w-16 aspect-h-9 mb-4 bg-[#0f172a] rounded-lg overflow-hidden">
                  <img
                    src={chart.image}
                    alt={chart.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-white font-medium mb-2">
                  {chart.title || "Untitled Chart"}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Type : {chart.chartType} ({chart.dimension})
                  </span>
                  <button
                    onClick={() => downloadChartPNG(chart)}
                    className="p-70 text-[#be185d] hover:bg-[#be185d]/10 rounded-lg transition-all"
                  >
                    <FaDownload className="text-xl download-png-button" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  Created At : {new Date(chart.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-[#1e293b] border-l-4 border-yellow-400 text-gray-200 px-4 py-3 mt-6 rounded-lg text-sm shadow-md">
        <p className="font-medium">
          ⚠️ You can download the chart images as{" "}
          <span className="text-yellow-300 font-semibold">PDF</span> or{" "}
          <span className="text-yellow-300 font-semibold">PNG</span> before they
          get{" "}
          <span className="underline text-red-400">deleted permanently</span>.
        </p>
      </div>

      {/* Managing Button  */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("/profile#chart-history")}
          className="flex items-center px-4 py-2 rounded-md bg-[#be185d] text-white hover:bg-[#be185d]/90 transition-all transform hover:scale-105 manage-chart"
        >
          Manage Your charts 
        </button>
      </div>

    </div>
  );
};

export default Charts;
