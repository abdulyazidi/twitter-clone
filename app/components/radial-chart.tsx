"use client";

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type ChartConfig, ChartContainer } from "~/components/ui/chart";

export const description = "A character count indicator";

interface CharacterCountIndicatorProps {
  currentLength: number;
  maxLength?: number;
}

export function CharacterCountIndicator({
  currentLength,
  maxLength = 280,
}: CharacterCountIndicatorProps) {
  // Calculate percentage and determine color
  const percentage = (currentLength / maxLength) * 100;
  const remaining = maxLength - currentLength;
  const exceeding = currentLength > maxLength ? currentLength - maxLength : 0;

  // Determine color based on percentage
  let fillColor = "deepskyblue";
  let textColor = "fill-muted-foreground";

  if (percentage >= 100) {
    fillColor = "hsl(0, 84%, 60%)"; // Red
    textColor = "fill-red-600";
  } else if (percentage >= 80) {
    fillColor = "hsl(45, 93%, 58%)"; // Yellow/Orange
    textColor = "fill-yellow-600";
  }

  const chartData = [
    {
      category: "characters",
      count: Math.min(currentLength, maxLength),
      fill: fillColor,
    },
  ];

  const chartConfig = {
    count: {
      label: "Characters",
    },
    category: {
      label: "Usage",
      color: fillColor,
    },
  } satisfies ChartConfig;

  // Determine what to display in the center
  const getCenterText = () => {
    if (exceeding > 0) {
      return {
        main: `+${exceeding}`,
        // sub: "over limit",
      };
    } else if (percentage >= 80) {
      return {
        main: remaining.toString(),
        // sub: "remaining",
      };
    } else {
      return {
        main: currentLength.toString(),
        // sub: "characters",
      };
    }
  };

  const centerText = getCenterText();

  return (
    <div className="w-12 h-12">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full h-full"
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={90 + (360 * Math.min(percentage, 100)) / 100}
          innerRadius={16}
          outerRadius={24}
          className="w-full h-full"
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted/20 last:fill-background"
            polarRadius={[20]}
          />
          <RadialBar
            dataKey="count"
            background={{ fill: "hsl(var(--muted))" }}
            cornerRadius={2}
            fill={fillColor}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 2}
                        className={`${textColor} text-xs font-semibold`}
                      >
                        {centerText.main}
                      </tspan>
                      {(percentage >= 80 || exceeding > 0) && (
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 8}
                          className={`${textColor} text-[8px]`}
                        >
                          {/* {centerText.sub} */}
                        </tspan>
                      )}
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}

// Keep the old component for backward compatibility
export function ChartRadialText() {
  return <CharacterCountIndicator currentLength={0} />;
}
