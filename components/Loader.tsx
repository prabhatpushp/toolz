"use client";

import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="relative w-24 h-24">
        <div className="absolute w-full h-full border-4 border-muted rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
