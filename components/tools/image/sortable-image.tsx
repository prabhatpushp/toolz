"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RotateCw, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SortableImageProps {
  image: {
    preview: string
    rotation: number
  }
  pageNumber: number
  pageSize: 'a4' | 'letter' | 'fit'
  orientation: 'portrait' | 'landscape'
  margin: 'none' | 'small' | 'large'
  onRotate: () => void
  onRemove: () => void
}

const PAGE_SIZES = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
} as const

const MARGINS = {
  none: 0,
  small: 10,
  large: 20,
} as const

export function SortableImage({ 
  image, 
  pageNumber,
  pageSize, 
  orientation, 
  margin, 
  onRotate, 
  onRemove 
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: image.preview
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getImageDimensions = () => {
    const img = new Image()
    img.src = image.preview
    const isRotated = image.rotation === 90 || image.rotation === 270
    return {
      original: {
        width: img.width,
        height: img.height
      },
      rotated: {
        width: isRotated ? img.height : img.width,
        height: isRotated ? img.width : img.height
      }
    }
  }

  const calculateDimensions = () => {
    const imgDim = getImageDimensions()
    const marginSize = MARGINS[margin]

    if (pageSize === 'fit') {
      return {
        pageWidth: imgDim.rotated.width + (marginSize * 2),
        pageHeight: imgDim.rotated.height + (marginSize * 2),
        imageWidth: imgDim.original.width,
        imageHeight: imgDim.original.height,
        x: marginSize,
        y: marginSize
      }
    }

    // For A4/Letter
    const dimensions = PAGE_SIZES[pageSize]
    const { width: pageWidth, height: pageHeight } = orientation === 'landscape'
      ? { width: dimensions.height, height: dimensions.width }
      : dimensions

    // Calculate scale factor based on rotated dimensions
    const scaleFactor = Math.min(
      (pageWidth - marginSize * 2) / imgDim.rotated.width,
      (pageHeight - marginSize * 2) / imgDim.rotated.height
    )

    // Calculate scaled dimensions of the original image
    const scaledWidth = imgDim.original.width * scaleFactor
    const scaledHeight = imgDim.original.height * scaleFactor

    // Center the image
    const x = (pageWidth - scaledWidth) / 2
    const y = (pageHeight - scaledHeight) / 2

    return {
      pageWidth,
      pageHeight,
      imageWidth: scaledWidth,
      imageHeight: scaledHeight,
      x: pageWidth / 2,  // Center point X
      y: pageHeight / 2  // Center point Y
    }
  }

  const dimensions = calculateDimensions()
  const aspectRatio = dimensions.pageHeight / dimensions.pageWidth

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group bg-gray-100 rounded-lg shadow-md overflow-hidden",
        isDragging && "opacity-50"
      )}
    >
      <div 
        className="relative w-full"
        style={{
          paddingBottom: `${aspectRatio * 100}%`
        }}
      >
        <div 
          className="absolute inset-0"
        >
          <div 
            className="absolute bg-white border border-gray-300"
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={image.preview}
              alt="Preview"
              style={{
                position: 'absolute',
                width: `${(dimensions.imageWidth / dimensions.pageWidth) * 100}%`,
                height: `${(dimensions.imageHeight / dimensions.pageHeight) * 100}%`,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                transformOrigin: 'center',
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          onClick={onRotate}
          className="h-8 w-8"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
      >
        <Button variant="secondary" size="icon" className="h-8 w-8">
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        Page {pageNumber}
      </div>
    </div>
  )
}