"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Wand2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiffViewer } from "@/components/tools/text/diff-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FormatType = "text" | "json" | "xml";

const formatText = (text: string, type: FormatType): string => {
  try {
    switch (type) {
      case "json":
        return JSON.stringify(JSON.parse(text), null, 2);
      case "xml":
        return text.replace(/>\s*</g, ">\n<").replace(/</g, "  <");
      default:
        return text;
    }
  } catch (error) {
    console.error(`Failed to format as ${type}:`, error);
    return text;
  }
};

const validateFormat = (text: string, type: FormatType): boolean => {
  try {
    switch (type) {
      case "json":
        JSON.parse(text);
        return true;
      case "xml":
        return text.trim().startsWith("<") && text.trim().endsWith(">");
      default:
        return true;
    }
  } catch {
    return false;
  }
};

export default function TextComparisonTool() {
  const diffSectionRef = useRef<HTMLDivElement>(null);
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [format, setFormat] = useState<FormatType>("text");
  const [oldValueError, setOldValueError] = useState<string>("");
  const [newValueError, setNewValueError] = useState<string>("");
  const [showOldBeautify, setShowOldBeautify] = useState(false);
  const [showNewBeautify, setShowNewBeautify] = useState(false);
  const [oldErrorFaded, setOldErrorFaded] = useState(false);
  const [newErrorFaded, setNewErrorFaded] = useState(false);
  const [formatChangeOldError, setFormatChangeOldError] = useState<string>("");
  const [formatChangeNewError, setFormatChangeNewError] = useState<string>("");
  const [formatErrorFading, setFormatErrorFading] = useState(false);

  const oldErrorTimeoutRef = useRef<NodeJS.Timeout>();
  const newErrorTimeoutRef = useRef<NodeJS.Timeout>();
  const previousFormatRef = useRef<FormatType>("text");

  useEffect(() => {
    return () => {
      if (oldErrorTimeoutRef.current) clearTimeout(oldErrorTimeoutRef.current);
      if (newErrorTimeoutRef.current) clearTimeout(newErrorTimeoutRef.current);
    };
  }, []);

  const onDrop = (acceptedFiles: File[], type: "old" | "new") => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
        const formatType =
          fileExtension === "json" || fileExtension === "xml"
            ? (fileExtension as FormatType)
            : "text";
        const formattedText = formatText(text, formatType);

        if (type === "old") {
          setOldValue(formattedText);
        } else {
          setNewValue(formattedText);
        }
      };
      reader.readAsText(file);
    });
  };

  const { getRootProps: getOldRootProps, getInputProps: getOldInputProps } =
    useDropzone({
      onDrop: (files) => onDrop(files, "old"),
      accept: {
        "text/*": [".txt", ".json", ".xml"],
        "application/json": [".json"],
        "application/xml": [".xml"],
      },
    });

  const { getRootProps: getNewRootProps, getInputProps: getNewInputProps } =
    useDropzone({
      onDrop: (files) => onDrop(files, "new"),
      accept: {
        "text/*": [".txt", ".json", ".xml"],
        "application/json": [".json"],
        "application/xml": [".xml"],
      },
    });

  const processedOldValue = oldValue.replace(/\s+/g, " ").trim();
  const processedNewValue = newValue.replace(/\s+/g, " ").trim();

  const scrollToDiff = () => {
    diffSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormatChange = (newFormat: FormatType) => {
    if (oldErrorTimeoutRef.current) clearTimeout(oldErrorTimeoutRef.current);
    if (newErrorTimeoutRef.current) clearTimeout(newErrorTimeoutRef.current);

    const isOldValid = validateFormat(oldValue, newFormat);
    const isNewValid = validateFormat(newValue, newFormat);

    if (newFormat !== "text" && (!isOldValid || !isNewValid)) {
      if (!isOldValid) {
        setFormatChangeOldError(`Invalid ${newFormat.toUpperCase()} format`);
      }
      if (!isNewValid) {
        setFormatChangeNewError(`Invalid ${newFormat.toUpperCase()} format`);
      }

      setFormatErrorFading(false);
      setTimeout(() => {
        setFormatErrorFading(true);
      }, 1000);

      setTimeout(() => {
        setFormatChangeOldError("");
        setFormatChangeNewError("");
        setFormatErrorFading(false);
      }, 3000);

      setFormat(previousFormatRef.current);
    } else {
      previousFormatRef.current = newFormat;
      setFormat(newFormat);
      setOldValueError("");
      setNewValueError("");
      setOldErrorFaded(false);
      setNewErrorFaded(false);
    }

    setShowOldBeautify(needsBeautification(oldValue, newFormat));
    setShowNewBeautify(needsBeautification(newValue, newFormat));
  };

  const needsBeautification = (text: string, type: FormatType): boolean => {
    if (!text.trim()) return false;

    try {
      switch (type) {
        case "json":
          const formatted = JSON.stringify(JSON.parse(text), null, 2);
          return formatted !== text;
        case "xml":
          const formattedXml = text
            .replace(/>\s*</g, ">\n<")
            .replace(/</g, "  <");
          return formattedXml !== text;
        default:
          return false;
      }
    } catch {
      return false;
    }
  };

  const handleOldValueChange = (text: string) => {
    setOldValue(text);
    if (format !== "text") {
      const isValid = validateFormat(text, format);
      if (!isValid) {
        setOldValueError(`Invalid ${format.toUpperCase()} format`);
        if (oldErrorTimeoutRef.current)
          clearTimeout(oldErrorTimeoutRef.current);
        oldErrorTimeoutRef.current = setTimeout(() => {
          setOldErrorFaded(true);
        }, 3000);
      } else {
        setOldValueError("");
        setOldErrorFaded(false);
      }
    }
    setShowOldBeautify(needsBeautification(text, format));
  };

  const handleNewValueChange = (text: string) => {
    setNewValue(text);
    if (format !== "text") {
      const isValid = validateFormat(text, format);
      if (!isValid) {
        setNewValueError(`Invalid ${format.toUpperCase()} format`);
        if (newErrorTimeoutRef.current)
          clearTimeout(newErrorTimeoutRef.current);
        newErrorTimeoutRef.current = setTimeout(() => {
          setNewErrorFaded(true);
        }, 3000);
      } else {
        setNewValueError("");
        setNewErrorFaded(false);
      }
    }
    setShowNewBeautify(needsBeautification(text, format));
  };

  const beautifyText = (type: "old" | "new") => {
    const text = type === "old" ? oldValue : newValue;

    try {
      let formatted = text;
      switch (format) {
        case "json":
          formatted = JSON.stringify(JSON.parse(text), null, 2);
          break;
        case "xml":
          formatted = text.replace(/>\s*</g, ">\n<").replace(/</g, "  <");
          break;
      }

      if (type === "old") {
        setOldValue(formatted);
        setShowOldBeautify(false);
        setOldValueError("");
      } else {
        setNewValue(formatted);
        setShowNewBeautify(false);
        setNewValueError("");
      }
    } catch (error) {
      if (type === "old") {
        setOldValueError(`Failed to beautify ${format.toUpperCase()}`);
      } else {
        setNewValueError(`Failed to beautify ${format.toUpperCase()}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-center flex-1">
            Text Comparison Tool
          </h1>
          <div className="w-48">
            <Select value={format} onValueChange={handleFormatChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Original Text</h2>
            <div
              {...getOldRootProps()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <input {...getOldInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload original text file
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: TXT, JSON, XML
              </p>
            </div>
            <div className="relative">
              <textarea
                value={oldValue}
                onChange={(e) => handleOldValueChange(e.target.value)}
                className="w-full h-[400px] p-4 mt-4 rounded-md border bg-background"
                placeholder="Enter or paste original text here..."
              />
              {formatChangeOldError && (
                <Alert
                  variant="destructive"
                  className={cn(
                    "absolute top-2 right-2 z-10 bg-destructive/95 max-w-[200px] py-2 px-3",
                    "pointer-events-none transition-opacity duration-[3000ms]",
                    formatErrorFading ? "opacity-0" : "opacity-100"
                  )}
                >
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-xs text-destructive-foreground">
                    {formatChangeOldError}
                  </AlertDescription>
                </Alert>
              )}
              {oldValueError && (
                <Alert
                  variant="destructive"
                  className={cn(
                    "absolute top-2 right-2 z-10 bg-destructive/95 max-w-[200px] py-2 px-3",
                    "pointer-events-auto transition-opacity duration-300",
                    oldErrorFaded
                      ? "opacity-50 hover:opacity-100"
                      : "opacity-100"
                  )}
                  onMouseEnter={() => {
                    setOldErrorFaded(false);
                    if (oldErrorTimeoutRef.current)
                      clearTimeout(oldErrorTimeoutRef.current);
                    oldErrorTimeoutRef.current = setTimeout(() => {
                      setOldErrorFaded(true);
                    }, 3000);
                  }}
                >
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-xs text-destructive-foreground">
                    {oldValueError}
                  </AlertDescription>
                </Alert>
              )}
              {showOldBeautify && (
                <Button
                  variant="secondary"
                  size="default"
                  className="absolute top-6 right-2 z-20"
                  onClick={() => beautifyText("old")}
                  title="Beautify"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Modified Text</h2>
            <div
              {...getNewRootProps()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <input {...getNewInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload modified text file
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: TXT, JSON, XML
              </p>
            </div>
            <div className="relative">
              <textarea
                value={newValue}
                onChange={(e) => handleNewValueChange(e.target.value)}
                className="w-full h-[400px] p-4 mt-4 rounded-md border bg-background"
                placeholder="Enter or paste modified text here..."
              />
              {formatChangeNewError && (
                <Alert
                  variant="destructive"
                  className={cn(
                    "absolute top-2 right-2 z-10 bg-destructive/95 max-w-[200px] py-2 px-3",
                    "pointer-events-none transition-opacity duration-[3000ms]",
                    formatErrorFading ? "opacity-0" : "opacity-100"
                  )}
                >
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-xs text-destructive-foreground">
                    {formatChangeNewError}
                  </AlertDescription>
                </Alert>
              )}
              {newValueError && (
                <Alert
                  variant="destructive"
                  className={cn(
                    "absolute top-2 right-2 z-10 bg-destructive/95 max-w-[200px] py-2 px-3",
                    "pointer-events-auto transition-opacity duration-300",
                    newErrorFaded
                      ? "opacity-50 hover:opacity-100"
                      : "opacity-100"
                  )}
                  onMouseEnter={() => {
                    setNewErrorFaded(false);
                    if (newErrorTimeoutRef.current)
                      clearTimeout(newErrorTimeoutRef.current);
                    newErrorTimeoutRef.current = setTimeout(() => {
                      setNewErrorFaded(true);
                    }, 3000);
                  }}
                >
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <AlertDescription className="text-xs text-destructive-foreground">
                    {newValueError}
                  </AlertDescription>
                </Alert>
              )}
              {showNewBeautify && (
                <Button
                  variant="secondary"
                  size="default"
                  className="absolute top-6 right-2 z-20"
                  onClick={() => beautifyText("new")}
                  title="Beautify"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6" ref={diffSectionRef}>
        <h2 className="text-2xl font-semibold mb-4">Comparison Result</h2>
        <DiffViewer oldValue={oldValue} newValue={newValue} />
      </Card>
    </div>
  );
}
