import {
    BarChart3,
    Image,
    ListTodo,
    Link2,
    PieChart,
    Search as SearchIcon,
    Code2,
    FileJson2,
    FileCode2,
    FileCode,
    KeyRound,
    Mail,
    Layout,
    Binary,
    DollarSign,
    QrCode,
    Clock,
    FileType2,
    ImagePlus,
    Images,
    FileImage,
    FileText,
    FileVideo,
    Settings,
    Wand2,
    Calendar,
    CheckSquare,
    Globe,
    Network,
    Trello
} from "lucide-react";

export interface Tool {
    title: string;
    description: string;
    id: string;
    slug: string;
    icon: any;
    category?: string
}

const imageTools: Tool[] = [
    {
        "title": "Image Compressor",
        "description": "Compress and optimize your images while maintaining quality for faster loading times.",
        "icon": FileImage,
        "id": "image-compress-001",
        "slug": "compress"
    },
    {
        "title": "Convert Images to PDF",
        "description": "Convert your images to PDF format with professional quality and layout options.",
        "icon": FileText,
        "id": "image-pdf-001",
        "slug": "convert-to-pdf"
    }
]

const pdfTools: Tool[] = [
    {
        "title": "Convert PDF to Images",
        "description": "Extract and convert PDF pages into high-quality images in various formats.",
        "icon": Images,
        "id": "pdf-images-001",
        "slug": "convert-to-images"
    },
    {
        "title": "Merge PDFs",
        "description": "Combine multiple PDF files into a single document with customizable order.",
        "icon": FileText,
        "id": "pdf-merge-001",
        "slug": "merge-pdf"
    },
    {
        "title": "Split PDF",
        "description": "Divide your PDF into multiple files by pages or sections with precision.",
        "icon": FileType2,
        "id": "pdf-split-001",
        "slug": "split-pdf"
    }
]

const textTools: Tool[] = [
    {
        "title": "Compare Text",
        "description": "Compare and analyze differences between two text documents efficiently.",
        "icon": FileCode,
        "id": "text-compare-001",
        "slug": "compare-text"
    }
]

const vocabularyTools: Tool[] = [
    {
        "title": "Flash Cards",
        "description": "Create and study with digital flash cards for effective vocabulary learning.",
        "icon": Layout,
        "id": "vocab-flash-001",
        "slug": "flash-cards"
    }
]

const toolsData = [
    {
        "name": "Image Tools",
        "description": "Professional tools for image manipulation and conversion.",
        "id": "image-tools-001",
        "slug": "image-tools",
        "icon": Image,
        "categoryIcon": Image,
        "tools": imageTools
    },
    {
        "name": "PDF Tools",
        "description": "Comprehensive suite of tools for PDF manipulation and management.",
        "id": "pdf-tools-001",
        "slug": "pdf-tools",
        "icon": FileText,
        "categoryIcon": FileText,
        "tools": pdfTools
    },
    {
        "name": "Text Tools",
        "description": "Advanced tools for text analysis and manipulation.",
        "id": "text-tools-001",
        "slug": "text-tools",
        "icon": FileCode,
        "categoryIcon": FileCode,
        "tools": textTools
    },
    {
        "name": "Vocabulary Tools",
        "description": "Interactive tools for vocabulary enhancement and learning.",
        "id": "vocab-tools-001",
        "slug": "vocabulary-tools",
        "icon": Layout,
        "categoryIcon": Layout,
        "tools": vocabularyTools
    },
]

export const tools = toolsData.flatMap((category) => category.tools.map((tool) => ({ ...tool, category: category.slug })))

export const categories = toolsData.map((category) => ({ slug: category.slug, name: category.name, description: category.description, icon: category.categoryIcon }))

export const toolsByCategory = tools.reduce((acc, tool) => {
    if (acc[tool.category]) {
        acc[tool.category].push(tool);
    } else {
        acc[tool.category] = [tool];
    }
    return acc;
}, {} as Record<string, Tool[]>);