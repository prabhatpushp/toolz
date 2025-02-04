import { useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiffMethod } from "react-diff-viewer-continued";
import { useSettingsStore } from "@/store/settings-store";

interface DiffViewerProps {
  oldValue: string;
  newValue: string;
  format?: "text" | "json" | "xml" | "csv";
}

export function DiffViewer({ oldValue, newValue, format }: DiffViewerProps) {
  const [splitView, setSplitView] = useState(true);
  const [diffMethod, setDiffMethod] = useState<DiffMethod>(
    "diffWords" as DiffMethod
  );
  const [codeFold, setCodeFold] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [hideWhitespaceDiff, setHideWhitespaceDiff] = useState(false);

  const isDarkMode = useSettingsStore((state) => state.theme) === "dark";

  const renderCodeFoldMessage = (diffLines: number, unChangedLines: number) => (
    <span>{`${unChangedLines} unchanged lines collapsed`}</span>
  );

  const processText = (text: string) => {
    let processed = text;
    if (!caseSensitive) {
      processed = processed.toLowerCase();
    }
    if (hideWhitespaceDiff) {
      processed = processed.replace(/\s+/g, " ");
    }
    return processed;
  };

  const renderCsvTable = (csv: string) => {
    const rows = csv.split("\n").map((row) => row.split(","));
    return (
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {rows[0].map((cell, i) => (
              <th key={i} className="border p-2 bg-muted">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border p-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Label>Comparison Method</Label>
          <Select
            value={diffMethod}
            onValueChange={(value: string) =>
              setDiffMethod(value as DiffMethod)
            }
          >
            <SelectTrigger className="w-[180px] border-2">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diffWords">Words</SelectItem>
              <SelectItem value="diffChars">Characters</SelectItem>
              <SelectItem value="diffLines">Lines</SelectItem>
              <SelectItem value="diffWordsWithSpace">
                Words with Spaces
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="split-view"
            checked={splitView}
            onCheckedChange={setSplitView}
          />
          <Label htmlFor="split-view">Split View</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="code-fold"
            checked={codeFold}
            onCheckedChange={setCodeFold}
          />
          <Label htmlFor="code-fold">Collapse Unchanged Lines</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="case-sensitive"
            checked={caseSensitive}
            onCheckedChange={setCaseSensitive}
          />
          <Label htmlFor="case-sensitive">Case Sensitive</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="whitespace-diff"
            checked={hideWhitespaceDiff}
            onCheckedChange={setHideWhitespaceDiff}
          />
          <Label htmlFor="whitespace-diff">Ignore Whitespace Changes</Label>
        </div>
      </div>

      {format === "csv" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="mb-2 font-semibold">Original</h3>
            {renderCsvTable(oldValue)}
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Modified</h3>
            {renderCsvTable(newValue)}
          </div>
        </div>
      ) : (
        <ReactDiffViewer
          oldValue={processText(oldValue)}
          newValue={processText(newValue)}
          splitView={splitView}
          compareMethod={diffMethod}
          leftTitle="Original"
          rightTitle="Modified"
          hideLineNumbers={false}
          showDiffOnly={codeFold}
          codeFoldMessageRenderer={codeFold ? renderCodeFoldMessage : undefined}
          extraLinesSurroundingDiff={2}
          disableWordDiff={diffMethod === "diffLines"}
          useDarkTheme={isDarkMode}
        />
      )}
    </div>
  );
}
