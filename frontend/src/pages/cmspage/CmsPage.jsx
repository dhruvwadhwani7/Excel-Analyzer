import React from "react";

const CmsPage = ({ title, content }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h1>
        <div
          className="prose prose-invert prose-lg max-w-none leading-relaxed text-justify"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default CmsPage;
