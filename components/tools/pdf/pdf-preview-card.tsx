"use client";

import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

interface PdfPreviewCardProps {
  file: File;
  pageNumber: number;
  pdfDocument?: pdfjsLib.PDFDocumentProxy | null;
  onPdfLoad?: (doc: pdfjsLib.PDFDocumentProxy) => void;
  showPageNumber?: boolean;
}

const PdfPreviewCard = ({
  file,
  pageNumber,
  pdfDocument,
  onPdfLoad,
  showPageNumber = true,
}: PdfPreviewCardProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        let doc = pdfDocument;

        if (!doc) {
          const arrayBuffer = await file.arrayBuffer();
          doc = await pdfjsLib.getDocument(arrayBuffer).promise;
          onPdfLoad?.(doc);
        }

        const page = await doc.getPage(pageNumber);

        const desiredWidth = 200;
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        if (!context) throw new Error("Could not get canvas context");

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
        setThumbnailUrl(thumbnailUrl);
      } catch (error) {
        console.error("Error generating thumbnail:", error);
      }
    };

    generateThumbnail();
  }, [file, pageNumber, pdfDocument, onPdfLoad]);

  if (!thumbnailUrl) {
    return (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center border border-border/10">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full border border-border/10">
      <img
        src={thumbnailUrl}
        alt={`Page ${pageNumber}`}
        className="w-full h-full object-contain bg-white"
      />
      {showPageNumber && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
          Page {pageNumber}
        </div>
      )}
    </div>
  );
};

export default PdfPreviewCard;
