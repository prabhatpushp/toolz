"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import {
  FileUp,
  Trash2,
  ImageIcon,
} from 'lucide-react';
import PdfPreviewCard from './pdf-preview-card';
import JSZip from 'jszip';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  ranges: { start: number | null; end: number | null }[];
}

interface ConversionSettings {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  dpi: number;
  preserveTransparency: boolean;
  pngLossless: boolean;
}

const getUniqueFileName = (name: string, existingNames: Set<string>): string => {
  let uniqueName = name;
  let counter = 1;
  while (existingNames.has(uniqueName)) {
    uniqueName = `${name} (${counter})`;
    counter++;
  }
  return uniqueName;
};

export default function PdfToImages() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfDocuments, setPdfDocuments] = useState<{ [key: string]: pdfjsLib.PDFDocumentProxy }>({});

  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'png',
    quality: 0.8,
    dpi: 150,
    preserveTransparency: true,
    pngLossless: true,
  });

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const existingNames = new Set(pdfFiles.map(file => file.name));
      
      const duplicates = acceptedFiles.filter(file => 
        existingNames.has(file.name) || 
        acceptedFiles.filter(f => f.name === file.name).length > 1
      );

      if (duplicates.length > 0) {
        toast.error("Files with the same names will be automatically renamed.", {
          position: "bottom-right",
          duration: 4000,
        });
      }

      const newFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const pageCount = pdf.numPages;

          const uniqueName = getUniqueFileName(file.name, existingNames);
          existingNames.add(uniqueName);

          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: uniqueName,
            pageCount,
            ranges: [{ start: 1, end: pageCount }],
          };
        })
      );

      setPdfFiles((prev) => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} new file${newFiles.length > 1 ? 's' : ''}`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Please ensure you've uploaded valid PDF files.", {
        position: "bottom-right",
      });
    }
  }, [pdfFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const updateRange = (fileId: string, index: number, field: 'start' | 'end', value: number | null) => {
    setPdfFiles((prev) =>
      prev.map((file) => {
        if (file.id === fileId) {
          const newRanges = [...file.ranges];
          newRanges[index] = { ...newRanges[index], [field]: value };
          return { ...file, ranges: newRanges };
        }
        return file;
      })
    );
  };

  const addRange = (fileId: string) => {
    setPdfFiles((prev) =>
      prev.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            ranges: [...file.ranges, { start: null, end: null }],
          };
        }
        return file;
      })
    );
  };

  const removeRange = (fileId: string, index: number) => {
    setPdfFiles((prev) =>
      prev.map((file) => {
        if (file.id === fileId) {
          const newRanges = file.ranges.filter((_, i) => i !== index);
          return { ...file, ranges: newRanges.length ? newRanges : [{ start: 1, end: file.pageCount }] };
        }
        return file;
      })
    );
  };

  const convertToImages = async () => {
    if (pdfFiles.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      // Calculate total pages to process
      let totalPages = 0;
      pdfFiles.forEach(file => {
        file.ranges.forEach(range => {
          if (range.start && range.end) {
            totalPages += range.end - range.start + 1;
          }
        });
      });

      // Single page conversion
      if (totalPages === 1 && pdfFiles.length === 1) {
        const pdfFile = pdfFiles[0];
        const range = pdfFile.ranges[0];
        if (!range.start || !range.end) return;

        const pdf = await pdfjsLib.getDocument(await pdfFile.file.arrayBuffer()).promise;
        const page = await pdf.getPage(range.start);
        const viewport = page.getViewport({ scale: settings.dpi / 72 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (!context) return;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL(
          `image/${settings.format}`,
          settings.format === 'png' && settings.pngLossless ? undefined : settings.quality
        );

        const link = document.createElement('a');
        link.href = imageData;
        link.download = `${pdfFile.name.replace('.pdf', '')}.${settings.format}`;
        link.click();
      } else {
        const zip = new JSZip();
        let processedPages = 0;

        const usedFolderNames = new Set<string>();

        for (const pdfFile of pdfFiles) {
          const baseFolderName = pdfFile.name.replace('.pdf', '');
          const folder = pdfFiles.length > 1 
            ? zip.folder(getUniqueFileName(baseFolderName, usedFolderNames))
            : zip;

          if (!folder) continue;

          if (pdfFiles.length > 1) {
            usedFolderNames.add(baseFolderName);
          }

          for (const range of pdfFile.ranges) {
            if (!range.start || !range.end) continue;

            for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
              const page = await pdfjsLib.getDocument(await pdfFile.file.arrayBuffer()).promise.then(pdf => pdf.getPage(pageNum));
              const viewport = page.getViewport({ scale: settings.dpi / 72 });

              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              if (!context) continue;

              await page.render({
                canvasContext: context,
                viewport: viewport,
              }).promise;

              const imageData = canvas.toDataURL(
                `image/${settings.format}`,
                settings.format === 'png' && settings.pngLossless ? undefined : settings.quality
              );

              const base64Data = imageData.split(',')[1];
              folder.file(
                `page_${pageNum}.${settings.format}`,
                base64Data,
                { base64: true }
              );

              processedPages++;
              setProgress((processedPages / totalPages) * 100);
            }
          }
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = pdfFiles.length === 1 
          ? `${pdfFiles[0].name.replace('.pdf', '')}.zip`
          : 'converted_images.zip';
        link.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`Successfully converted ${totalPages} page${totalPages > 1 ? 's' : ''} to image${totalPages > 1 ? 's' : ''}`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("An error occurred during conversion.", {
        position: "bottom-right",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">PDF to Images</h1>
        <p className="text-muted-foreground mt-2">
          Convert PDF pages to high-quality images
        </p>
      </div>

      {/* Always show the upload space */}
      <Card className="overflow-hidden border-dashed mb-6">
        <div
          {...getRootProps()}
          className={`p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'bg-primary/5' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            {isDragActive ? "Drop your PDFs here..." : "Drop your PDFs here, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Processing large or multiple PDF files may require significant computational resources
          </p>
        </div>
      </Card>

      {pdfFiles.length > 0 && (
        <div className="grid grid-cols-[300px,1fr] gap-6">
          {/* Left Column - Settings and Controls */}
          <div className="sticky top-6 self-start space-y-6">
            {/* Settings Panel */}
            <Card className="p-4 space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['PNG', 'JPEG', 'WebP'].map((format) => (
                    <Button
                      key={format}
                      variant={settings.format.toUpperCase() === format.toUpperCase() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        format: format.toLowerCase() as 'png' | 'jpeg' | 'webp'
                      }))}
                    >
                      {format}
                    </Button>
                  ))}
                </div>
              </div>

              {/* DPI Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Resolution (DPI)</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    {[72, 150, 300, 'Custom'].map((dpi) => (
                      <Button
                        key={dpi}
                        variant={
                          dpi === 'Custom' 
                            ? settings.dpi !== 72 && settings.dpi !== 150 && settings.dpi !== 300 ? "default" : "outline"
                            : settings.dpi === dpi ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (dpi === 'Custom') {
                            // Only change to custom if not already on a preset
                            if (settings.dpi === 72 || settings.dpi === 150 || settings.dpi === 300) {
                              setSettings(prev => ({ ...prev, dpi: 200 }));
                            }
                          } else {
                            setSettings(prev => ({ ...prev, dpi: dpi as number }));
                          }
                        }}
                      >
                        {dpi}
                      </Button>
                    ))}
                  </div>
                  {settings.dpi !== 72 && settings.dpi !== 150 && settings.dpi !== 300 && (
                    <Input
                      type="number"
                      min="72"
                      max="600"
                      value={settings.dpi}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        dpi: Math.min(600, Math.max(72, parseInt(e.target.value) || 150))
                      }))}
                    />
                  )}
                </div>
              </div>

              {/* PNG Options - Moved above quality slider */}
              {settings.format === 'png' && (
                <div>
                  <label className="block text-sm font-medium mb-2">PNG Options</label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lossless"
                      checked={settings.pngLossless}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pngLossless: checked }))}
                    />
                    <label htmlFor="lossless" className="text-sm">Lossless compression</label>
                  </div>
                </div>
              )}

              {/* Quality Selection - Only show for JPEG, WebP, or lossy PNG */}
              {(settings.format === 'jpeg' || settings.format === 'webp' || (settings.format === 'png' && !settings.pngLossless)) && (
                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.quality * 100]}
                      onValueChange={(value) => setSettings(prev => ({ 
                        ...prev, 
                        quality: value[0] / 100 
                      }))}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>{Math.round(settings.quality * 100)}%</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={convertToImages}
                disabled={isProcessing || pdfFiles.length === 0}
              >
                {isProcessing ? (
                  "Converting..."
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Convert to Images
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPdfFiles([])}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            </div>

            {isProcessing && (
              <Progress value={progress} className="h-1" />
            )}
          </div>

          {/* Right Column - PDF Preview and Range Selection */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {pdfFiles.map((pdf, index) => (
              <Card key={pdf.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-24">
                        <PdfPreviewCard
                          file={pdf.file}
                          pageNumber={1}
                          pdfDocument={pdfDocuments[pdf.id]}
                          onPdfLoad={(doc) => setPdfDocuments(prev => ({ ...prev, [pdf.id]: doc }))}
                          showPageNumber={false}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{pdf.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pdf.pageCount} pages • {(pdf.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(pdf.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {pdf.pageCount > 1 ? (
                    <div className="space-y-3">
                      {pdf.ranges.map((range, index) => (
                        <div key={index} className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground">From page</label>
                            <Input
                              type="number"
                              min={1}
                              max={pdf.pageCount}
                              value={range.start || ''}
                              onChange={(e) => updateRange(
                                pdf.id, 
                                index, 
                                'start', 
                                parseInt(e.target.value) || null
                              )}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">To page</label>
                            <Input
                              type="number"
                              min={1}
                              max={pdf.pageCount}
                              value={range.end || ''}
                              onChange={(e) => updateRange(
                                pdf.id, 
                                index, 
                                'end', 
                                parseInt(e.target.value) || null
                              )}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRange(pdf.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Page Range
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Page selection is disabled for single-page documents
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 