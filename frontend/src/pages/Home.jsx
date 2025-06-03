import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Home = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    const userToken = sessionStorage.getItem('userToken');
    if (userToken) {
      navigate('/dashboard');
    } else {
      toast.info('Please sign in to upload files', {
        position: 'top-center',
      });
      navigate('/login');
    }
  };

  return (
    <div className="relative bg-[#020617]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#be185d]/20 to-transparent opacity-90 animate-gradient" />
      
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-8 tracking-tight">
            Transform Your Excel Data into Beautiful Charts
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Visualize your data like never before with our powerful Excel analysis tool.
            Turn complex spreadsheets into meaningful insights instantly.
          </p>
          <button
            onClick={handleUploadClick}
            className="px-8 py-4 bg-[#be185d] text-white rounded-lg font-bold text-lg 
            hover:bg-[#be185d]/90 transition-all duration-300 transform hover:scale-105 
            hover:shadow-xl hover:shadow-[#be185d]/30 active:scale-95"
          >
            Upload CSV or Excel files
          </button>
        </div>

        {/* Features Section */}
        <div className="w-full bg-[#0f172a]/50 py-24 animate-slideUp">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#1e293b]/40 backdrop-blur-sm transform 
            hover:scale-105 transition-all duration-300 hover:shadow-2xl 
            hover:shadow-[#be185d]/20 hover:bg-[#1e293b]/60 group animate-fadeIn">
              <h3 className="text-2xl font-bold text-white mb-4">Easy Upload</h3>
              <p className="text-gray-300">
                Simply drag and drop your Excel or CSV files to get started
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[#1e293b]/40 backdrop-blur-sm transform 
            hover:scale-105 transition-all duration-300 hover:shadow-2xl 
            hover:shadow-[#be185d]/20 hover:bg-[#1e293b]/60 group animate-fadeIn">
              <h3 className="text-2xl font-bold text-white mb-4">Smart Analysis</h3>
              <p className="text-gray-300">
                Advanced AI-powered analysis to generate the most relevant charts
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[#1e293b]/40 backdrop-blur-sm transform 
            hover:scale-105 transition-all duration-300 hover:shadow-2xl 
            hover:shadow-[#be185d]/20 hover:bg-[#1e293b]/60 group animate-fadeIn">
              <h3 className="text-2xl font-bold text-white mb-4">Export Anywhere</h3>
              <p className="text-gray-300">
                Download your visualizations in multiple formats
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="w-full py-24 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Ready to transform your data?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who have already discovered the power of our Excel analysis tool.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-[#be185d] rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div className="w-full py-16 animate-slideUp">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          border border-gray-800 hover:border-[#be185d] transition-all duration-300 
          group hover:scale-105 hover:shadow-2xl hover:shadow-[#be185d]/20 animate-fadeIn">
            <div className="flex flex-col h-full">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#be185d]">Data Visualization</h3>
              <p className="text-gray-300 mb-4">Transform your Excel data into interactive charts, graphs, and visual representations for better insights.</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          border border-gray-800 hover:border-[#be185d] transition-all duration-300 
          group hover:scale-105 hover:shadow-2xl hover:shadow-[#be185d]/20 animate-fadeIn">
            <div className="flex flex-col h-full">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#be185d]">Real-time Analysis</h3>
              <p className="text-gray-300 mb-4">Get instant analysis of your data with our powerful processing engine.</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          border border-gray-800 hover:border-[#be185d] transition-all duration-300 
          group hover:scale-105 hover:shadow-2xl hover:shadow-[#be185d]/20 animate-fadeIn">
            <div className="flex flex-col h-full">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#be185d]">Custom Reports</h3>
              <p className="text-gray-300 mb-4">Generate customized reports and export them in multiple formats for your needs.</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] 
          border border-gray-800 hover:border-[#be185d] transition-all duration-300 
          group hover:scale-105 hover:shadow-2xl hover:shadow-[#be185d]/20 animate-fadeIn">
            <div className="flex flex-col h-full">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#be185d]">Collaboration</h3>
              <p className="text-gray-300 mb-4">Share your analysis with team members and work together in real-time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-[#0f172a] border-t border-gray-800 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-[#be185d]">Home</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-[#be185d]">About</a></li>
                <li><a href="/features" className="text-gray-300 hover:text-[#be185d]">Features</a></li>
                <li><a href="/pricing" className="text-gray-300 hover:text-[#be185d]">Pricing</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/docs" className="text-gray-300 hover:text-[#be185d]">Documentation</a></li>
                <li><a href="/tutorials" className="text-gray-300 hover:text-[#be185d]">Tutorials</a></li>
                <li><a href="/api" className="text-gray-300 hover:text-[#be185d]">API Reference</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-gray-300 hover:text-[#be185d]">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-300 hover:text-[#be185d]">Terms of Service</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-300">support@excelanalyzer.com</li>
                <li className="text-gray-300">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-center text-gray-400">
              © {new Date().getFullYear()} Excel Analyzer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Add these styles at the end of your component */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
