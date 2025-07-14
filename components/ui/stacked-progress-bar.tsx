"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Define a interface para cada segmento da barra
interface ProgressBarSegment {
  value: number; // Porcentagem que este segmento ocupa (0 a 100)
  color: string; // Cor do segmento (ex: 'bg-blue-500', '#ff0000')
  tooltip: string; // Texto a ser exibido no hover
}

interface StackedProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: ProgressBarSegment[];
}

const StackedProgressBar = React.forwardRef<HTMLDivElement, StackedProgressBarProps>(
  ({ className, segments, ...props }, ref) => {
    return (
      // CORREÇÃO 1: Adicionada a classe 'flex' ao contêiner principal
      <div
        ref={ref}
        className={cn(
          "relative flex h-2 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            className="group relative h-full"
            style={{
              width: `${segment.value}%`,
              backgroundColor: segment.color,
              // CORREÇÃO 2: Removido 'display: inline-block' pois agora usamos flexbox
            }}
          >
            <span className="absolute bottom-full mb-2 hidden w-auto whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
              {segment.tooltip}
            </span>
          </div>
        ))}
      </div>
    );
  }
);
StackedProgressBar.displayName = "StackedProgressBar";

export { StackedProgressBar };