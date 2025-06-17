// src/components/ui/icon-button.tsx
import { type ReactNode, isValidElement, cloneElement, ReactElement, SVGProps } from "react";
import clsx from "clsx";

type ColorScheme = "gray" | "red" | "blue" | "green";


type IconButtonSize = "s" | "m" | "l";

interface IconButtonProps {
  children: ReactNode;
  colorScheme?: ColorScheme;
  size?: IconButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const colorMap: Record<ColorScheme, string> = {
  gray:
    "text-gray-700 border-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 hover:shadow-md focus:ring-gray-400",
  red:
    "text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-md focus:ring-red-300",
  blue:
    "text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-400 hover:shadow-md focus:ring-blue-300",
  green:
    "text-green-600 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-400 hover:shadow-md focus:ring-green-300",
};

const sizeMap: Record<IconButtonSize, string> = {
  s: "text-xs px-2 py-1",
  m: "text-sm px-3 py-1.5",
  l: "text-base px-4 py-2",
};

const iconSizeMap: Record<IconButtonSize, string> = {
  s: "size-4",
  m: "size-5",
  l: "size-6",
};

export function IconButton({
  children,
  colorScheme = "gray",
  size = "s",
  onClick,
  disabled,
  type = "button",
  className,
}: IconButtonProps) {
  // SVGにサイズクラスを付与
  let icon = children;
  if (
    isValidElement(children) &&
    typeof children.type === "string" &&
    children.type === "svg"
  ) {
    icon = cloneElement(
      children as ReactElement<SVGProps<SVGSVGElement>>,
      {
        className: clsx(
          (children.props as { className?: string }).className,
          iconSizeMap[size]
        ),
      }
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex items-center gap-1 font-medium rounded-md cursor-pointer border shadow-sm bg-white/80 backdrop-blur-sm transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
        sizeMap[size],
        colorMap[colorScheme],
        className
      )}
    >
      {icon}
    </button>
  );
}