"use client";

import PDFToImages from "@/components/tools/pdf/pdf-to-images";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <PDFToImages />
      </div>
    </main>
  );
}
