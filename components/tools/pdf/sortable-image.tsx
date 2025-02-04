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

  const getPageAspectRatio = () => {
    if (pageSize === 'fit') return null

    const dimensions = PAGE_SIZES[pageSize]
    const { width, height } = orientation === 'landscape' 
      ? { width: dimensions.height, height: dimensions.width }
      : dimensions

    return width / height
  }

  const aspectRatio = getPageAspectRatio()
  const marginSize = MARGINS[margin]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group bg-gray-100 rounded-lg shadow-md overflow-hidden border border-gray-200",
        isDragging && "opacity-50"
      )}
    >
      <div 
        className="relative w-full"
        style={{ 
          paddingBottom: aspectRatio ? `${(1 / aspectRatio) * 100}%` : '100%'
        }}
      >
        <div 
          className="absolute inset-0 bg-white"
          style={{
            margin: `${marginSize}px`,
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={image.preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{ transform: `rotate(${image.rotation}deg)` }}
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