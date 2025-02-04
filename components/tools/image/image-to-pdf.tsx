"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { PDFDocument, PageSizes, degrees } from "pdf-lib";
import EXIF from "exif-js";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableImage } from "@/components/tools/image/sortable-image";
import { Upload, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

type PageSize = "a4" | "letter" | "fit";
type PageOrientation = "portrait" | "landscape";
type PageMargin = "none" | "small" | "large";
type GridSize = "4" | "8" | "16";

interface ImageFile extends File {
  preview: string;
  rotation: number;
  id: string;
}

const PAGE_SIZES = {
  a4: PageSizes.A4,
  letter: PageSizes.Letter,
} as const;

const MARGINS = {
  none: 0,
  small: 10,
  large: 20,
} as const;

export function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [margin, setMargin] = useState<PageMargin>("small");
  const [gridSize, setGridSize] = useState<GridSize>("4");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        rotation: 0,
        id: uuidv4(),
      })
    );
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.preview === active.id);
        const newIndex = items.findIndex((item) => item.preview === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const rotateImage = async (imageFile: ImageFile) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set canvas dimensions based on the rotated image size
        const rotatedWidth =
          imageFile.rotation === 90 || imageFile.rotation === 270
            ? img.height
            : img.width;
        const rotatedHeight =
          imageFile.rotation === 90 || imageFile.rotation === 270
            ? img.width
            : img.height;

        canvas.width = rotatedWidth;
        canvas.height = rotatedHeight;

        // Rotate the image around its center
        ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
        ctx.rotate((imageFile.rotation * Math.PI) / 180);
        ctx.drawImage(
          img,
          -img.width / 2,
          -img.height / 2,
          img.width,
          img.height
        );

        // Convert to blob and then to ArrayBuffer
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob"));
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as ArrayBuffer);
            reader.readAsArrayBuffer(blob);
          },
          imageFile.type,
          1.0
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = imageFile.preview;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();

      for (const image of images) {
        // Get the rotated image data
        const imageData = await rotateImage(image);

        // Embed image
        const embeddedImage =
          image.type === "image/jpeg"
            ? await pdfDoc.embedJpg(imageData)
            : await pdfDoc.embedPng(imageData);

        // Calculate page size
        let pageWidth, pageHeight;
        if (pageSize === "fit") {
          pageWidth = embeddedImage.width + MARGINS[margin] * 2;
          pageHeight = embeddedImage.height + MARGINS[margin] * 2;
        } else {
          [pageWidth, pageHeight] = PAGE_SIZES[pageSize];
          if (orientation === "landscape") {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
          }
        }

        // Create page
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const marginSize = MARGINS[margin];

        if (pageSize === "fit") {
          // Draw image with margins
          page.drawImage(embeddedImage, {
            x: marginSize,
            y: marginSize,
            width: embeddedImage.width,
            height: embeddedImage.height,
          });
        } else {
          // Calculate dimensions to maintain aspect ratio
          const scaleFactor = Math.min(
            (pageWidth - marginSize * 2) / embeddedImage.width,
            (pageHeight - marginSize * 2) / embeddedImage.height
          );

          const width = embeddedImage.width * scaleFactor;
          const height = embeddedImage.height * scaleFactor;

          // Center the image on the page
          const x = (pageWidth - width) / 2;
          const y = (pageHeight - height) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width,
            height,
          });
        }
      }

      // Save and download the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted-images.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const gridSizeClass = {
    "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    "8": "grid-cols-2 md:grid-cols-4 lg:grid-cols-8",
    "16": "grid-cols-2 md:grid-cols-8 lg:grid-cols-16",
  }[gridSize];

  const handleRotation = (index: number) => {
    setImages(
      (prev) =>
        prev.map((img, i) =>
          i === index
            ? { ...img, rotation: ((img.rotation || 0) + 90) % 360 }
            : img
        ) as ImageFile[]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={pageSize}
          onValueChange={(value: PageSize) => setPageSize(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Page Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a4">A4 (210×297mm)</SelectItem>
            <SelectItem value="letter">Letter (215.9×279.4mm)</SelectItem>
            <SelectItem value="fit">Fit to Image</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={orientation}
          onValueChange={(value: PageOrientation) => setOrientation(value)}
          disabled={pageSize === "fit"}
        >
          <SelectTrigger
            title={
              pageSize === "fit"
                ? "Orientation is determined by the image when using 'Fit to Image'"
                : undefined
            }
          >
            <SelectValue placeholder="Orientation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={margin}
          onValueChange={(value: PageMargin) => setMargin(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Margin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Margin</SelectItem>
            <SelectItem value="small">Small (10mm)</SelectItem>
            <SelectItem value="large">Large (20mm)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={gridSize}
          onValueChange={(value: GridSize) => setGridSize(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Grid Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4 Columns</SelectItem>
            <SelectItem value="8">8 Columns</SelectItem>
            <SelectItem value="16">16 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop images here, or click to select files
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.preview)}
            strategy={rectSortingStrategy}
          >
            <div className={`grid ${gridSizeClass} gap-4`}>
              {images.map((image, index) => (
                <SortableImage
                  key={image.preview}
                  image={image}
                  pageNumber={index + 1}
                  onRotate={() => handleRotation(index)}
                  onRemove={() => removeImage(index)}
                  pageSize={pageSize}
                  orientation={orientation}
                  margin={margin}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex justify-end gap-4">
        <Button
          variant="destructive"
          onClick={() => setImages([])}
          disabled={images.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All
        </Button>
        <Button onClick={generatePDF} disabled={images.length === 0}>
          <FileUp className="mr-2 h-4 w-4" />
          Generate PDF
        </Button>
      </div>
    </div>
  );
}

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
