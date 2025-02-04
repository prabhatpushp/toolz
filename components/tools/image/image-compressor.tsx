"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import {
  Download,
  X,
  Upload,
  Image as ImageIcon,
  SplitSquareHorizontal,
} from "lucide-react";
import JSZip from "jszip";
import Compressor from "compressorjs";
import { ImageComparisonModal } from "./image-comparison-modal";
import { Checkbox } from "@/components/ui/checkbox";

interface ImageFile extends File {
  preview?: string;
  compressedSize?: number;
  compressedUrl?: string;
  originalFile?: File;
}

export default function ImageCompressor() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("jpeg");
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [pngLossyCompression, setPngLossyCompression] = useState(false);
  const [enableResize, setEnableResize] = useState(false);
  const [targetSize, setTargetSize] = useState(1024);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        originalFile: file,
      })
    );

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".gif"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index]?.preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      if (newFiles[index]?.compressedUrl) {
        URL.revokeObjectURL(newFiles[index].compressedUrl!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getOutputFileName = (file: ImageFile) => {
    const name = file.name || `image-${Date.now()}`;
    const baseName = name.includes(".")
      ? name.split(".").slice(0, -1).join(".")
      : name;
    return `${baseName}_compressed.${format}`;
  };

  const compressImage = async (file: ImageFile): Promise<ImageFile> => {
    const sourceFile = file.originalFile || file;

    if (file.compressedUrl) {
      URL.revokeObjectURL(file.compressedUrl);
    }

    return new Promise((resolve, reject) => {
      new Compressor(sourceFile, {
        quality: format === "png" && !pngLossyCompression ? 1 : quality / 100,
        mimeType:
          format === "png" && pngLossyCompression
            ? "image/jpeg"
            : `image/${format}`,
        ...(enableResize
          ? {
              maxWidth: targetSize,
              maxHeight: targetSize,
              width: undefined,
              height: undefined,
              resize: "cover",
            }
          : {
              maxWidth: undefined,
              maxHeight: undefined,
              width: undefined,
              height: undefined,
              resize: "none",
            }),
        ...(format === "png" && !pngLossyCompression
          ? {
              convertSize: 0,
              minWidth: 0,
              minHeight: 0,
            }
          : {}),
        strict: true,
        checkOrientation: true,
        success(result) {
          if (format === "png" && pngLossyCompression) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
              let width = img.width;
              let height = img.height;

              if (enableResize && (width > targetSize || height > targetSize)) {
                if (width > height) {
                  height = Math.round((height * targetSize) / width);
                  width = targetSize;
                } else {
                  width = Math.round((width * targetSize) / height);
                  height = targetSize;
                }
              }

              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);

              canvas.toBlob((pngBlob) => {
                if (pngBlob) {
                  const compressedUrl = URL.createObjectURL(pngBlob);
                  resolve({
                    ...file,
                    size: sourceFile.size,
                    name: sourceFile.name,
                    preview: file.preview,
                    compressedSize: pngBlob.size,
                    compressedUrl,
                    originalFile: sourceFile,
                  });
                } else {
                  reject(new Error("Failed to convert to PNG"));
                }
              }, "image/png");
            };

            img.onerror = () => {
              reject(new Error("Failed to load image for PNG conversion"));
            };

            img.src = URL.createObjectURL(result);
          } else {
            const compressedUrl = URL.createObjectURL(result);
            resolve({
              ...file,
              size: sourceFile.size,
              name: sourceFile.name,
              preview: file.preview,
              compressedSize: result.size,
              compressedUrl,
              originalFile: sourceFile,
            });
          }
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const handleCompression = async () => {
    setIsCompressing(true);
    const compressedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedFile = await compressImage(file);
        compressedFiles.push(compressedFile);
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i] = compressedFile;
          return newFiles;
        });
      } catch (error) {
        toast({
          title: "Compression failed",
          description: `Failed to compress ${file.name || "image"}`,
          variant: "destructive",
        });
      }
    }

    setIsCompressing(false);
    toast({
      title: "Success",
      description: "All images compressed successfully!",
    });
  };

  const downloadAll = async () => {
    const zip = new JSZip();

    const promises = files.map(async (file) => {
      if (file.compressedUrl) {
        const fileName = getOutputFileName(file);
        const response = await fetch(file.compressedUrl);
        const blob = await response.blob();
        zip.file(fileName, blob);
      }
    });

    await Promise.all(promises);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "compressed_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSingle = (file: ImageFile) => {
    if (!file.compressedUrl) return;

    const link = document.createElement("a");
    link.href = file.compressedUrl;
    link.download = getOutputFileName(file);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">
              {isDragActive
                ? "Drop your images here"
                : "Drag & drop images here, or click to select"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PNG, JPEG/JPG, GIF
            </p>
          </div>
        </div>
      </Card>

      {files.length > 0 && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Compression Quality: {quality}%
              </label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={10}
                max={100}
                step={1}
                className="w-full"
                disabled={format === "png" && !pngLossyCompression}
              />
            </div>
            <div className="w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Output Format
              </label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableResize"
                checked={enableResize}
                onCheckedChange={(checked) =>
                  setEnableResize(checked as boolean)
                }
              />
              <label
                htmlFor="enableResize"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Enable image resizing (maintains aspect ratio)
              </label>
            </div>

            {enableResize && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Target Size: {targetSize}px
                  </label>
                  <span className="text-xs text-muted-foreground">
                    (Longest edge will be resized to this value)
                  </span>
                </div>
                <Slider
                  value={[targetSize]}
                  onValueChange={(value) => setTargetSize(value[0])}
                  min={100}
                  max={4096}
                  step={8}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  Range: 100px - 4096px
                </div>
              </div>
            )}
          </div>

          {format === "png" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pngLossy"
                checked={pngLossyCompression}
                onCheckedChange={(checked) =>
                  setPngLossyCompression(checked as boolean)
                }
              />
              <label
                htmlFor="pngLossy"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Enable lossy compression for PNG (smaller file size, may reduce
                quality)
              </label>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-1">
            {format === "png"
              ? pngLossyCompression
                ? "Using JPEG-based compression to reduce PNG file size (may affect quality)"
                : "Using lossless PNG compression to maintain original quality"
              : "JPEG compression may reduce image quality for smaller file sizes"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <Card key={file.preview} className="p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="aspect-video relative rounded-md overflow-hidden mb-3">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name || "Image preview"}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name || "Unnamed image"}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>Original: {(file.size / 1024).toFixed(1)} KB</p>
                    {file.compressedSize && (
                      <p>
                        Compressed: {(file.compressedSize / 1024).toFixed(1)} KB
                        (
                        {Math.round(
                          ((file.size - file.compressedSize) / file.size) * 100
                        )}
                        % reduction)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {file.compressedUrl && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => downloadSingle(file)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImage(file)}
                        >
                          <SplitSquareHorizontal className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={handleCompression}
              disabled={isCompressing || files.length === 0}
            >
              {isCompressing ? "Compressing..." : "Compress Images"}
            </Button>
            {files.some((f) => f.compressedUrl) && (
              <Button onClick={downloadAll} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        </Card>
      )}

      {selectedImage && (
        <ImageComparisonModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage}
        />
      )}
    </div>
  );
}
