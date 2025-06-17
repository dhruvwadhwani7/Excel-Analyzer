import { useParams } from "react-router-dom";
import CmsPages from "../data/pages";
import CmsPage from "./CmsPage";
import { useEffect, useState } from "react";

const DynamicCmsPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const matchedPage = CmsPages.find(p => p.path === slug);
      setPage(matchedPage);
      setIsLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-[#be185d] border-r-4 border-r-transparent"></div>
          <p className="mt-4 text-white text-lg">Loading page...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we load this content</p>
        </div>
      </div>
    );
  }

  if (!page) {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-[#be185d] mb-4 animate-pulse">404</h1>
      <p className="text-2xl text-white mb-2">Page Not Found</p>
      <p className="text-gray-400 text-center max-w-md mb-6">
        The page you are looking for doesn't exist or may have been moved.
      </p>
    </div>
  );
}

  return <CmsPage title={page.title} content={page.content} />;
};
export default DynamicCmsPage;