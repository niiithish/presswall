import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: "solid" | "outline" | "mono-light";
}

type LogoVariant = NonNullable<BrandLogoProps["variant"]>;

const BG_FILLS: Record<LogoVariant, string> = {
  solid: "#111111",
  outline: "transparent",
  "mono-light": "#ffffff",
};

const STROKES: Record<LogoVariant, string | undefined> = {
  solid: undefined,
  outline: "#111111",
  "mono-light": undefined,
};

const PATH_FILLS: Record<LogoVariant, string> = {
  solid: "#ffffff",
  outline: "#111111",
  "mono-light": "#111111",
};

const CIRCLE_FILLS: Record<LogoVariant, string> = {
  solid: "#111111",
  outline: "#ffffff",
  "mono-light": "#111111",
};

export function BrandLogo({
  className,
  size = 40,
  variant = "solid",
}: BrandLogoProps) {
  const stroke = STROKES[variant];

  return (
    <svg
      aria-label="Presswall"
      className={cn("shrink-0", className)}
      fill="none"
      height={size}
      role="img"
      viewBox="0 0 48 48"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        fill={BG_FILLS[variant]}
        height={48}
        rx={12}
        stroke={stroke}
        strokeWidth={stroke ? 2 : undefined}
        width={48}
      />
      <path
        d="M16 35V13h8.5c4.7 0 7.5 2.8 7.5 7s-2.8 7-7.5 7H21v8h-5z"
        fill={PATH_FILLS[variant]}
      />
      <circle cx={20.5} cy={20} fill={CIRCLE_FILLS[variant]} r={2.5} />
    </svg>
  );
}
