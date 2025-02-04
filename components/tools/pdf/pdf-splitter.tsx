"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import RangeInput from './range-input';
import {
  FileUp,
  Split as SplitIcon,
  Grid2X2,
  SplitSquareHorizontal,
  X,
} from 'lucide-react';
import PdfPreviewCard from './pdf-preview-card';
import * as pdfjsLib from 'pdfjs-dist';

interface Range {
  start: number | null;
  end: number | null;
}

interface PDFInfo {
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  file: File;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PDFSplitter() {
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [ranges, setRanges] = useState<Range[]>([{ start: 1, end: null }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergeFiles, setMergeFiles] = useState(false);
  const [splitMode, setSplitMode] = useState<'range' | 'extract'>('range');
  const [fixedPageCount, setFixedPageCount] = useState(1);
  const { toast } = useToast();
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [fixedPageCountInput, setFixedPageCountInput] = useState<string | null>(null);
  const [fixedPageCountTimeout, setFixedPageCountTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadPdfJs = async () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    };
    loadPdfJs();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = arrayBuffer.slice(0);
      const pdf = await PDFDocument.load(buffer);
      const pageCount = pdf.getPageCount();

      setPdfInfo({
        name: file.name,
        size: file.size,
        pageCount,
        arrayBuffer: buffer,
        file: file,
      });

      // Update default range and fixed page count to match total pages
      setRanges([{ start: 1, end: pageCount }]);
      setSplitMode('range');
      setFixedPageCount(pageCount);
      setFixedPageCountInput(pageCount.toString());
      setMergeFiles(false);

      toast({
        title: "PDF loaded successfully",
        description: `${pageCount} pages detected`,
      });
    } catch (error) {
      console.error('PDF loading error:', error);
      toast({
        variant: "destructive",
        title: "Error loading PDF",
        description: "Please ensure you've uploaded a valid PDF file.",
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const addRange = () => {
    if (!pdfInfo) return;
    const lastRange = ranges[ranges.length - 1];
    const newStart = lastRange.end !== null ? lastRange.end : pdfInfo.pageCount;
    const newEnd = pdfInfo.pageCount;
    setRanges([...ranges, { start: newStart, end: newEnd }]);
  };

  const removeRange = (index: number) => {
    const newRanges = ranges.filter((_, i) => i !== index);
    setRanges(newRanges);
  };

  const updateRange = (index: number, field: keyof Range, value: number | null) => {
    const newRanges = [...ranges];
    newRanges[index] = {
      ...newRanges[index],
      [field]: value,
    };
    setRanges(newRanges);
  };

  const handleFixedPageCountChange = (value: string) => {
    setFixedPageCountInput(value);

    if (fixedPageCountTimeout) {
      clearTimeout(fixedPageCountTimeout);
    }

    const timeout = setTimeout(() => {
      if (!pdfInfo) return;

      const count = Math.max(1, Math.min(parseInt(value) || 1, pdfInfo.pageCount));
      setFixedPageCount(count);

      // Calculate new ranges based on fixed page count
      const newRanges: Range[] = [];
      let currentPage = 1;

      while (currentPage <= pdfInfo.pageCount) {
        const endPage = Math.min(currentPage + count - 1, pdfInfo.pageCount);
        newRanges.push({
          start: currentPage,
          end: endPage,
        });
        currentPage = endPage + 1;
      }

      setRanges(newRanges);
    }, 1000);

    setFixedPageCountTimeout(timeout);
  };

  const handleFixedPageCountBlur = () => {
    if (fixedPageCountTimeout) {
      clearTimeout(fixedPageCountTimeout);
    }
    handleFixedPageCountChange(fixedPageCountInput || "1");
  };

  const resetFile = () => {
    if (pdfDocument) {
      pdfDocument.destroy();
    }
    setPdfDocument(null);
    setPdfInfo(null);
    setRanges([{ start: 1, end: null }]);
    setProgress(0);
    setMergeFiles(false);
    setSplitMode('range');
    setFixedPageCount(1);
  };

  const splitPDF = async () => {
    if (!pdfInfo) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const sourcePdf = await PDFDocument.load(pdfInfo.arrayBuffer);
      const splitPdfs = [];

      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        if (range.start === null || range.end === null || range.start < 1 || range.end > pdfInfo.pageCount || range.start > range.end) {
          continue; // Skip invalid ranges
        }

        const newPdf = await PDFDocument.create();

        for (let j = range.start - 1; j < range.end; j++) {
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [j]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        splitPdfs.push({
          name: `${pdfInfo.name.replace('.pdf', '')}_${range.start}-${range.end}.pdf`,
          data: pdfBytes,
        });

        setProgress(((i + 1) / ranges.length) * 100);
      }

      if (mergeFiles || splitPdfs.length === 1) {
        const mergedPdf = await PDFDocument.create();
        for (const pdf of splitPdfs) {
          const doc = await PDFDocument.load(pdf.data);
          const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          pages.forEach(page => mergedPdf.addPage(page));
        }
        const mergedBytes = await mergedPdf.save();
        const url = URL.createObjectURL(new Blob([mergedBytes], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pdfInfo.name.replace('.pdf', '')}_merged.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const zip = new JSZip();
        splitPdfs.forEach(pdf => {
          zip.file(pdf.name, pdf.data);
        });

        const zipContent = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipContent);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pdfInfo.name.replace('.pdf', '')}_split.zip`;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "PDF split successfully",
        description: `Created ${splitPdfs.length} file${splitPdfs.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error splitting PDF",
        description: "An error occurred while splitting the PDF.",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Split PDF</h1>
        <p className="text-muted-foreground mt-2">
          Split your PDF into multiple files or extract specific pages
        </p>
      </div>

      {!pdfInfo ? (
        <Card className="overflow-hidden border-dashed">
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
              {isDragActive
                ? "Drop your PDF here..."
                : "Drop your PDF here, or click to select"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Processing large PDF files may require significant computational resources
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{pdfInfo.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pdfInfo.pageCount} pages • {(pdfInfo.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-[300px,1fr] gap-6">
            <div className="sticky top-6 self-start space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={splitMode === 'range' ? 'default' : 'outline'}
                  onClick={() => setSplitMode('range')}
                  className="w-full"
                >
                  <SplitSquareHorizontal className="h-4 w-4 mr-2" />
                  Split by range
                </Button>
                <Button
                  variant={splitMode === 'extract' ? 'default' : 'outline'}
                  onClick={() => setSplitMode('extract')}
                  className="w-full"
                >
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  Fixed pages
                </Button>
              </div>

              <Card className="p-4">
                {splitMode === 'range' ? (
                  <div className="space-y-4">
                    {ranges.map((range, index) => (
                      <RangeInput
                        key={index}
                        index={index}
                        range={range}
                        maxPages={pdfInfo.pageCount}
                        onUpdate={updateRange}
                        onRemove={removeRange}
                        showRemove={ranges.length > 1}
                      />
                    ))}
                    <Button
                      variant="outline"
                      onClick={addRange}
                      className="w-full"
                    >
                      + Add Range
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pages per file</label>
                    <Input
                      type="number"
                      min={1}
                      max={pdfInfo.pageCount}
                      value={fixedPageCountInput || ""}
                      onChange={(e) => handleFixedPageCountChange(e.target.value)}
                      onBlur={handleFixedPageCountBlur}
                    />
                  </div>
                )}
              </Card>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="merge"
                  checked={mergeFiles}
                  onCheckedChange={(checked) => setMergeFiles(checked as boolean)}
                />
                <label htmlFor="merge" className="text-sm text-muted-foreground">
                  Merge all ranges in one PDF file
                </label>
              </div>

              <Button 
                className="w-full"
                onClick={splitPDF}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <SplitIcon className="h-4 w-4 mr-2" />
                    Split PDF
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={progress} className="h-1" />
              )}
            </div>

            <Card className="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="grid gap-6">
                {ranges.map((range, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium">Range {index + 1}</h3>
                    <div className="flex items-center gap-6">
                      {range.start === null || range.start < 1 ? (
                        <div className="relative w-[200px] aspect-[3/4] bg-muted/30 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                          <div className="p-6 text-center">
                            <div className="text-destructive mb-2">⚠️</div>
                            <p className="text-sm text-destructive font-medium">Invalid Start Page</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Page number must be between 1 and {pdfInfo.pageCount}
                            </p>
                          </div>
                        </div>
                      ) : range.end === null || range.end > pdfInfo.pageCount ? (
                        <>
                          <div className="relative w-[200px] aspect-[3/4] shadow-md rounded-lg overflow-hidden">
                            <PdfPreviewCard 
                              file={pdfInfo.file}
                              pageNumber={range.start}
                              pdfDocument={pdfDocument}
                              onPdfLoad={(doc) => setPdfDocument(doc)}
                              showPageNumber={true}
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-2xl text-muted-foreground">→</span>
                          </div>
                          <div className="relative w-[200px] aspect-[3/4] bg-muted/30 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                            <div className="p-6 text-center">
                              <div className="text-destructive mb-2">⚠️</div>
                              <p className="text-sm text-destructive font-medium">Invalid End Page</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Page number must be between 1 and {pdfInfo.pageCount}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : range.start > range.end ? (
                        <>
                          <div className="relative w-[200px] aspect-[3/4] shadow-md rounded-lg overflow-hidden">
                            <PdfPreviewCard 
                              file={pdfInfo.file}
                              pageNumber={range.start}
                              pdfDocument={pdfDocument}
                              onPdfLoad={(doc) => setPdfDocument(doc)}
                              showPageNumber={true}
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-2xl text-muted-foreground">→</span>
                          </div>
                          <div className="relative w-[200px] aspect-[3/4] bg-muted/30 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                            <div className="p-6 text-center">
                              <div className="text-destructive mb-2">⚠️</div>
                              <p className="text-sm text-destructive font-medium">Invalid Range</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Start page cannot be greater than end page
                              </p>
                            </div>
                          </div>
                        </>
                      ) : range.start === range.end ? (
                        <div className="flex items-center">
                          <div className="relative w-[200px] aspect-[3/4] shadow-md rounded-lg overflow-hidden">
                            <PdfPreviewCard 
                              file={pdfInfo.file}
                              pageNumber={range.start}
                              pdfDocument={pdfDocument}
                              onPdfLoad={(doc) => setPdfDocument(doc)}
                              showPageNumber={true}
                            />
                          </div>
                          <div className="ml-3 px-3 py-1 text-sm text-muted-foreground bg-muted rounded-md">
                            Single page
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="relative w-[200px] aspect-[3/4] shadow-md rounded-lg overflow-hidden">
                            <PdfPreviewCard 
                              file={pdfInfo.file}
                              pageNumber={range.start}
                              pdfDocument={pdfDocument}
                              onPdfLoad={(doc) => setPdfDocument(doc)}
                              showPageNumber={true}
                            />
                          </div>
                          <div className="flex items-center">
                            <span className="text-2xl text-muted-foreground">→</span>
                          </div>
                          <div className="relative w-[200px] aspect-[3/4] shadow-md rounded-lg overflow-hidden">
                            <PdfPreviewCard 
                              file={pdfInfo.file}
                              pageNumber={range.end}
                              pdfDocument={pdfDocument}
                              onPdfLoad={(doc) => setPdfDocument(doc)}
                              showPageNumber={true}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}