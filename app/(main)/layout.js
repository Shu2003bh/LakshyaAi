import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;