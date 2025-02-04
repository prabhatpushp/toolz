"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileUp,
  MoveUp,
  MoveDown,
  Trash2,
  FilePlus2,
  FileOutput,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import PdfPreviewCard from './pdf-preview-card';
import * as pdfjsLib from 'pdfjs-dist';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from "@/components/ui/input";
import { DialogTrigger } from "@/components/ui/dialog";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  selectedPages: Set<number>;
  currentPage: number;
  isExpanded?: boolean;
}

export default function PDFMerger() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfDocuments, setPdfDocuments] = useState<{ [key: string]: pdfjsLib.PDFDocumentProxy }>({});
  const { toast } = useToast();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const newFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const pageCount = pdf.getPageCount();

          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            pageCount,
            selectedPages: new Set([...Array(pageCount)].map((_, i) => i + 1)),
            currentPage: 1,
          };
        })
      );

      setPdfFiles((prev) => [...prev, ...newFiles]);
      toast({
        title: "PDFs added successfully",
        description: `Added ${newFiles.length} new file${newFiles.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading PDF",
        description: "Please ensure you've uploaded valid PDF files.",
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setPdfFiles((prev) => {
      const index = prev.findIndex((file) => file.id === id);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev;
      }

      const newFiles = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const togglePage = (fileId: string, pageNumbers: number | number[], forceState?: boolean) => {
    setPdfFiles((prev) =>
      prev.map((file) => {
        if (file.id === fileId) {
          const newSelectedPages = new Set(file.selectedPages);
          const pages = Array.isArray(pageNumbers) ? pageNumbers : [pageNumbers];
          
          pages.forEach(pageNumber => {
            if (forceState === undefined) {
              // Toggle behavior
              if (newSelectedPages.has(pageNumber)) {
                newSelectedPages.delete(pageNumber);
              } else {
                newSelectedPages.add(pageNumber);
              }
            } else {
              // Force state behavior
              if (forceState) {
                newSelectedPages.add(pageNumber);
              } else {
                newSelectedPages.delete(pageNumber);
              }
            }
          });
          
          return { ...file, selectedPages: newSelectedPages };
        }
        return file;
      })
    );
  };

  const toggleFileExpansion = (id: string) => {
    setPdfFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, isExpanded: !file.isExpanded } : file
      )
    );
  };

  const updateCurrentPage = (fileId: string, newPage: number) => {
    setPdfFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, currentPage: newPage }
          : file
      )
    );
  };

  const mergePDFs = async () => {
    if (pdfFiles.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const mergedPdf = await PDFDocument.create();
      let processedFiles = 0;

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const selectedPagesArray = Array.from(pdfFile.selectedPages).sort((a, b) => a - b);
        
        const pages = await mergedPdf.copyPages(pdf, selectedPagesArray.map(p => p - 1));
        pages.forEach(page => mergedPdf.addPage(page));

        processedFiles++;
        setProgress((processedFiles / pdfFiles.length) * 100);
      }

      const mergedBytes = await mergedPdf.save();
      const url = URL.createObjectURL(new Blob([mergedBytes], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDFs merged successfully",
        description: `Combined ${pdfFiles.length} files into one PDF`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error merging PDFs",
        description: "An error occurred while merging the PDFs.",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPdfFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Merge PDFs</h1>
        <p className="text-muted-foreground mt-2">
          Combine multiple PDF files into a single document
        </p>
      </div>

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
              ? "Drop your PDFs here..."
              : "Drop your PDFs here, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Processing large or multiple PDF files may require significant computational resources
          </p>
        </div>
      </Card>

      {pdfFiles.length > 0 && (
        <div className="space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={pdfFiles.map(pdf => pdf.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pdfFiles.map((pdf, index) => (
                  <SortableItem 
                    key={pdf.id} 
                    pdf={pdf} 
                    index={index}
                    pdfDocuments={pdfDocuments}
                    setPdfDocuments={setPdfDocuments}
                    updateCurrentPage={updateCurrentPage}
                    togglePage={togglePage}
                    removeFile={removeFile}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setPdfFiles([])}
              disabled={isProcessing}
            >
              Clear All
            </Button>
            <Button
              onClick={mergePDFs}
              disabled={isProcessing || pdfFiles.length === 0}
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <FileOutput className="h-4 w-4 mr-2" />
                  Merge PDFs
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <Progress value={progress} className="h-1" />
          )}
        </div>
      )}
    </div>
  );
}

function SortableItem({ 
  pdf, 
  index, 
  pdfDocuments,
  setPdfDocuments,
  updateCurrentPage,
  togglePage,
  removeFile
}: { 
  pdf: PDFFile; 
  index: number;
  pdfDocuments: { [key: string]: pdfjsLib.PDFDocumentProxy };
  setPdfDocuments: React.Dispatch<React.SetStateAction<{ [key: string]: pdfjsLib.PDFDocumentProxy }>>;
  updateCurrentPage: (fileId: string, newPage: number) => void;
  togglePage: (fileId: string, pageNumber: number | number[], forceState?: boolean) => void;
  removeFile: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: pdf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [pageInput, setPageInput] = useState(pdf.currentPage.toString());
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(true);

  const handleSelectAll = () => {
    if (selectAll) {
      togglePage(pdf.id, Array.from({ length: pdf.pageCount }, (_, i) => i + 1), false);
    } else {
      togglePage(pdf.id, Array.from({ length: pdf.pageCount }, (_, i) => i + 1), true);
    }
    setSelectAll(!selectAll);
  };

  const truncateFilename = (filename: string, maxLength: number = 30) => {
    if (filename.length <= maxLength) return filename;
    const ext = filename.split('.').pop();
    const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'));
    const half = Math.floor((maxLength - 3) / 2);
    return `${nameWithoutExt.slice(0, half)}...${nameWithoutExt.slice(-half)}.${ext}`;
  };

  useEffect(() => {
    setSelectAll(pdf.selectedPages.size === pdf.pageCount);
  }, [pdf.selectedPages.size, pdf.pageCount]);

  const renderPageSelector = () => {
    const pagesPerView = 10;
    const totalViews = Math.ceil(pdf.pageCount / pagesPerView);

    const handlePageInputChange = (value: string) => {
      setPageInput(value);
      const pageNumber = parseInt(value);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= pdf.pageCount) {
        const newPage = Math.ceil(pageNumber / pagesPerView);
        updateCurrentPage(pdf.id, newPage);
      }
    };

    return (
      <Dialog open={openDialogId === pdf.id} onOpenChange={() => setOpenDialogId(null)}>
        <DialogContent className="max-w-[90%] w-[1400px] max-h-[90vh] h-[900px] flex flex-col p-0 my-auto">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                Select Pages - {truncateFilename(pdf.name)}
              </DialogTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="whitespace-nowrap"
                >
                  {selectAll ? 'Deselect All' : 'Select All'}
                </Button>
                <div className="flex items-center gap-2 pr-16">
                  <span className="text-sm text-muted-foreground">Go to page:</span>
                  <Input
                    type="number"
                    min={1}
                    max={pdf.pageCount}
                    value={pageInput}
                    onChange={(e) => handlePageInputChange(e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">of {pdf.pageCount}</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(Math.min(pagesPerView, pdf.pageCount - (pdf.currentPage - 1) * pagesPerView))].map((_, i) => {
                const pageNumber = (pdf.currentPage - 1) * pagesPerView + i + 1;
                return (
                  <div key={pageNumber} className="space-y-2">
                    <div className="relative w-[200px] aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-md">
                      <PdfPreviewCard
                        file={pdf.file}
                        pageNumber={pageNumber}
                        pdfDocument={pdfDocuments[pdf.id]}
                        onPdfLoad={(doc) => setPdfDocuments(prev => ({ ...prev, [pdf.id]: doc }))}
                      />
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={pdf.selectedPages.has(pageNumber)}
                          onCheckedChange={() => togglePage(pdf.id, pageNumber)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t bg-background">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {pdf.selectedPages.size} pages selected
              </div>
              <div className="flex items-center gap-2 pr-16">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateCurrentPage(pdf.id, Math.max(1, pdf.currentPage - 1))}
                  disabled={pdf.currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Page</span>
                  <span className="font-medium">{pdf.currentPage}</span>
                  <span>of</span>
                  <span className="font-medium">{totalViews}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateCurrentPage(pdf.id, Math.min(totalViews, pdf.currentPage + 1))}
                  disabled={pdf.currentPage === totalViews}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <Card className="group relative h-full">
        <CardContent className="p-4">
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-move"
              {...attributes}
              {...listeners}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="currentColor"
              >
                <path d="M4 4h2v2H4V4zm6 0h2v2h-2V4zM4 9h2v2H4V9zm6 0h2v2h-2V9z" />
              </svg>
            </Button>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenDialogId(pdf.id)}
                >
                  <FileUp className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => removeFile(pdf.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="pt-8">
            <div className="aspect-[3/4] shadow-md rounded-lg overflow-hidden relative">
              <PdfPreviewCard
                file={pdf.file}
                pageNumber={1}
                pdfDocument={pdfDocuments[pdf.id]}
                onPdfLoad={(doc) => setPdfDocuments(prev => ({ ...prev, [pdf.id]: doc }))}
                showPageNumber={false}
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
            </div>
            <div className="mt-2">
              <p className="font-medium truncate">{pdf.name}</p>
              <p className="text-sm text-muted-foreground">
                {pdf.pageCount} pages • {(pdf.file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <p className="text-sm text-muted-foreground">
                {pdf.selectedPages.size} pages selected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {renderPageSelector()}
    </div>
  );
} 