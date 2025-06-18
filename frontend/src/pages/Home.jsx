
import { useState } from 'react';
import {
  FaUpload,
  FaChartBar,
  FaFileAlt,
  FaCog,
  FaMagic,
  FaLightbulb,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    title: 'Upload your Excel file',
    description:
      'Easily upload your Excel file using the Upload button or drag and drop. Supported formats: .xls, .xlsx, .csv.',
    icon: <FaUpload className="text-blue-600" size={24} />,
  },
  {
    title: 'Analyze and generate reports',
    description:
      'Our analyzer processes your data quickly, creating insightful charts and detailed reports automatically.',
    icon: <FaChartBar className="text-green-600" size={24} />,
  },
  {
    title: 'Customize and share',
    description:
      'Tailor your visual reports with various customization options, then download or share with your team seamlessly.',
    icon: <FaFileAlt className="text-purple-600" size={24} />,
  },
];

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleStep = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 py-16 flex-grow">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-center mb-20 max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-extrabold text-navy-900 mb-4">Welcome to Excel Analyzer</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your Excel files into insightful, interactive charts and reports — fast and effortlessly.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-md hover:scale-105 transition-transform">
            Get Started
          </button>
        </motion.section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
          {[FaUpload, FaChartBar, FaFileAlt].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.4, duration: 0.8, ease: 'easeOut' }}
              className={`bg-white rounded-xl shadow-lg p-8 border-l-8 ${
                i === 0 ? 'border-blue-600' : i === 1 ? 'border-green-600' : 'border-purple-600'
              } hover:shadow-xl transition-shadow`}
            >
              <div className="flex justify-center mb-4 text-blue-600">
                <Icon size={40} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {i === 0
                  ? 'Upload Excel File'
                  : i === 1
                  ? 'Charts Created'
                  : 'Files Uploaded'}
              </h3>
              <p className={`text-${i === 0 ? 'gray-600' : '4xl font-bold text-gray-800'}`}>
                {i === 0 ? 'Easily upload your Excel spreadsheets and start your analysis immediately.' : '0'}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Features Section */}
        <section className="max-w-5xl mx-auto mb-20 px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[FaMagic, FaCog, FaLightbulb].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.4, duration: 0.8, ease: 'easeOut' }}
                className="flex space-x-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <Icon size={36} className={`${i === 0 ? 'text-blue-600' : i === 1 ? 'text-green-600' : 'text-purple-600'} mt-1`} />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {i === 0
                      ? 'Automated Insights'
                      : i === 1
                      ? 'Customizable Dashboards'
                      : 'Smart Recommendations'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {i === 0
                      ? 'Generate meaningful insights automatically from your raw Excel data.'
                      : i === 1
                      ? 'Design dashboards tailored to your unique data visualization needs.'
                      : 'Receive intelligent suggestions to improve your data presentations.'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Accordion Section (How It Works) */}
        <section className="max-w-3xl mx-auto px-4 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleStep(index)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left focus:outline-none"
                  aria-expanded={activeIndex === index}
                  aria-controls={`step-desc-${index}`}
                >
                  <div className="flex items-center space-x-4">
                    {step.icon}
                    <span className="text-lg font-semibold text-gray-900">{step.title}</span>
                  </div>
                  <div className="text-gray-600">
                    {activeIndex === index ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                  </div>
                </button>
                <AnimatePresence initial={false}>
                   {activeIndex === index && (
                    <motion.div
                      key="content"
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                    <div className="px-6 py-4 text-gray-700">
                     {step.description}
                    </div>
                   </motion.div>
                     )}
                 </AnimatePresence>
                    </div>
              ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-700 via-purple-800 to-blue-900 text-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">Excel Analyzer</h3>
            <p className="text-sm max-w-xs">
              Your go-to platform for transforming Excel data into actionable insights.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-yellow-400 transition-colors">About</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Features</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Contact</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-300">
          &copy; {new Date().getFullYear()} Excel Analyzer. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
