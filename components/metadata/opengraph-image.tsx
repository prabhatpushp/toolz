import { ImageResponse } from "next/og";

// Color scheme configurations
export const colorSchemes: Record<
  string,
  {
    background: string;
    primary: string;
    secondary: string;
    accent1: string;
    accent2: string;
    text: string;
    card: string;
    footer: string;
  }
> = {
  dark: {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    primary: "#4f46e5",
    secondary: "#818cf8",
    accent1: "#c084fc",
    accent2: "#f472b6",
    text: "#ffffff",
    card: "#1f2937",
    footer: "#111827",
  },
  light: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    primary: "#3b82f6",
    secondary: "#60a5fa",
    accent1: "#818cf8",
    accent2: "#6366f1",
    text: "#1e293b",
    card: "#ffffff",
    footer: "#f8fafc",
  },
  blue: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    primary: "#60a5fa",
    secondary: "#93c5fd",
    accent1: "#3b82f6",
    accent2: "#2563eb",
    text: "#ffffff",
    card: "#1e40af",
    footer: "#1e3a8a",
  },
  pink: {
    background: "linear-gradient(135deg, #831843 0%, #db2777 100%)",
    primary: "#f472b6",
    secondary: "#f9a8d4",
    accent1: "#ec4899",
    accent2: "#db2777",
    text: "#ffffff",
    card: "#9d174d",
    footer: "#831843",
  },
  orange: {
    background: "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)",
    primary: "#fb923c",
    secondary: "#fdba74",
    accent1: "#f97316",
    accent2: "#ea580c",
    text: "#ffffff",
    card: "#9a3412",
    footer: "#7c2d12",
  },
  green: {
    background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
    primary: "#34d399",
    secondary: "#6ee7b7",
    accent1: "#10b981",
    accent2: "#059669",
    text: "#ffffff",
    card: "#065f46",
    footer: "#064e3b",
  },
  purple: {
    background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
    primary: "#a78bfa",
    secondary: "#c4b5fd",
    accent1: "#8b5cf6",
    accent2: "#7c3aed",
    text: "#ffffff",
    card: "#5b21b6",
    footer: "#4c1d95",
  },
  teal: {
    background: "linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)",
    primary: "#5eead4",
    secondary: "#99f6e4",
    accent1: "#2dd4bf",
    accent2: "#14b8a6",
    text: "#ffffff",
    card: "#115e59",
    footer: "#134e4a",
  },
  red: {
    background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
    primary: "#f87171",
    secondary: "#fca5a5",
    accent1: "#ef4444",
    accent2: "#dc2626",
    text: "#ffffff",
    card: "#991b1b",
    footer: "#7f1d1d",
  },
};

export default async function OgImage(
  colorScheme: string,
  tool: string,
  category: string | undefined,
  url: string,
  title: string | undefined
) {
  // Get colors from selected scheme
  const colors = colorSchemes[colorScheme] || colorSchemes.dark;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: "80px",
          background: colors.background,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern options */}
        {(() => {
          const patterns = [
            // Square grid
            {
              backgroundImage: `
                linear-gradient(${colors.text} 1px, transparent 1px),
                linear-gradient(90deg, ${colors.text} 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
              opacity: 0.04,
            },
            // Diagonal lines
            {
              backgroundImage: `
                linear-gradient(45deg, transparent 96%, ${colors.text} 96%),
                linear-gradient(-45deg, transparent 96%, ${colors.text} 96%)
              `,
              backgroundSize: "30px 30px",
              opacity: 0.06,
            },
            // Triangular
            {
              backgroundImage: `
                linear-gradient(45deg, transparent 90%, ${colors.text} 90%),
                linear-gradient(-45deg, transparent 90%, ${colors.text} 90%),
                linear-gradient(135deg, transparent 90%, ${colors.text} 90%),
                linear-gradient(-135deg, transparent 90%, ${colors.text} 90%)
              `,
              backgroundSize: "30px 30px",
              opacity: 0.05,
            },
          ];

          // Select a random pattern
          const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

          return (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                ...selectedPattern,
                pointerEvents: "none",
              }}
            />
          );
        })()}

        {/* Decorative shapes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const shapes = [
            // Circle
            { borderRadius: "50%" },
            // Square
            { borderRadius: "40px" },
            // Triangle (using clip-path)
            { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" },
            // Pentagon
            {
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            },
          ];

          const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
          const size = 40 + Math.random() * 160;
          const rotation = Math.random() * 360;
          const opacity = 0.05 + Math.random() * 0.15;
          const top = Math.random() * 100;
          const left = Math.random() * 100;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                background:
                  i % 2 === 0
                    ? `linear-gradient(${rotation}deg, ${colors.primary}, ${colors.secondary})`
                    : `linear-gradient(${rotation}deg, ${colors.accent1}, ${colors.accent2})`,
                opacity,
                transform: `rotate(${rotation}deg)`,
                transition: "all 0.3s ease",
                ...randomShape,
              }}
            />
          );
        })}

        {/* Content */}
        {category && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "18px",
              background: colors.primary,
              padding: "12px 28px",
              borderRadius: "24px",
              color: colors.text,
              marginBottom: "40px",
              border: `1px solid ${colors.secondary}`,
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "24px" }}>⚡️</span>
            {category}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontSize: "60px",
            fontWeight: "bold",
            background: `linear-gradient(90deg, ${colors.secondary}, ${colors.accent1})`,
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
            maxWidth: "1000px",
            marginBottom: "32px",
            zIndex: 1,
          }}
        >
          {title}
        </div>

        {/* Features section */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "20px",
            zIndex: 1,
          }}
        >
          {[
            { icon: "🎯", text: "100+ Tools", color: colors.secondary },
            { icon: "🔒", text: "Privacy Focused", color: colors.accent1 },
            { icon: "⚡️", text: "Free Forever", color: colors.accent2 },
          ].map((feature) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 28px",
                background: colors.card,
                borderRadius: "20px",
                color: feature.color,
                fontSize: "20px",
                border: `1px solid ${feature.color}`,
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "24px" }}>{feature.icon}</span>
              {feature.text}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "80px",
            background: colors.footer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
            borderTop: `1px solid ${colors.text}`,
            opacity: "0.9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                background: `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2})`,
                borderRadius: "12px",
                color: colors.text,
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {tool}
            </div>
            {url && (
              <div
                style={{
                  color: colors.text,
                  fontSize: "16px",
                  opacity: "0.8",
                }}
              >
                {`${url}`}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: colors.text,
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            🛠️ toolz.dev
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
