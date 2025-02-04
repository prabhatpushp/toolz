import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageFile } from "@/types/image";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

interface ImageComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageFile;
}

export function ImageComparisonModal({
  isOpen,
  onClose,
  image,
}: ImageComparisonModalProps) {
  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full">
        <DialogTitle>Image Comparison</DialogTitle>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Original: {(image.size / 1024).toFixed(1)} KB
            </div>
            <div className="text-sm text-muted-foreground">
              Compressed: {(image.compressedSize! / 1024).toFixed(1)} KB (
              {Math.round(
                ((image.size - image.compressedSize!) / image.size) * 100
              )}
              % reduction)
            </div>
          </div>

          <div
            className="relative w-full"
            style={{ height: "calc(90vh - 120px)" }}
          >
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={image.preview!}
                  alt="Original image"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={image.compressedUrl!}
                  alt="Compressed image"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              }
              position={50}
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Drag the slider to compare images
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
