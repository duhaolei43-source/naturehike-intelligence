"use client";
import { useEffect, useRef } from "react";
import {
  init,
  use as registerCharts,
  type EChartsCoreOption,
} from "echarts/core";
import { ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  BrushComponent,
  ToolboxComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { Product } from "@/lib/schema";
import type { Weight } from "@/lib/analysis";
registerCharts([
  ScatterChart,
  GridComponent,
  TooltipComponent,
  BrushComponent,
  ToolboxComponent,
  SVGRenderer,
]);
export default function PriceChart({
  rows,
  weight,
  selected,
  onSelect,
}: {
  rows: Product[];
  weight: Weight;
  selected: string[];
  onSelect: (ids: string[]) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const chart = init(ref.current!, undefined, { renderer: "svg" });
    const valid = rows.filter(
      (p) => p.price_usd !== null && p[weight] !== null,
    );
    const nh = valid.filter((p) => p.brand_id === "naturehike"),
      other = valid.filter((p) => p.brand_id !== "naturehike");
    const groups = [nh, other];
    const option: EChartsCoreOption = {
      animation: false,
      grid: { left: 64, right: 24, bottom: 56, top: 35 },
      tooltip: {
        trigger: "item",
        renderMode: "richText",
        formatter: (params: unknown) => {
          const item = params as { data: { name: string; value: number[] } };
          return `${item.data.name}\nUSD ${item.data.value[0]} / ${item.data.value[1]} g`;
        },
      },
      brush: { toolbox: ["rect", "clear"], xAxisIndex: 0, yAxisIndex: 0 },
      xAxis: {
        type: "value",
        name: "Observed price / USD",
        nameLocation: "middle",
        nameGap: 35,
        min: 0,
      },
      yAxis: {
        type: "value",
        name: weight === "minimum_weight_g" ? "Minimum / g" : "Packed / g",
        min: 0,
      },
      series: groups.map((group, i) => ({
        type: "scatter",
        name: i === 0 ? "Naturehike" : "Other sampled offers",
        symbol: i === 0 ? "triangle" : "circle",
        symbolSize: 14,
        data: group.map((p) => ({
          name: `${p.product_name} · ${p.product_variant}`,
          value: [p.price_usd, p[weight]],
          id: p.product_id,
          itemStyle: {
            color: i === 0 ? "#157a80" : "#486276",
            opacity:
              selected.length && !selected.includes(p.product_id) ? 0.25 : 1,
            borderColor: selected.includes(p.product_id)
              ? "#a85f08"
              : "#fafcfe",
            borderWidth: 2,
          },
        })),
      })),
    };
    chart.setOption(option);
    chart.on("click", (event: unknown) => {
      const e = event as { data?: { id?: string } };
      if (e.data?.id) onSelect([e.data.id]);
    });
    // Only user-finished brushes change selection. brushselected also fires during
    // setOption and would create a render/reset loop when controlled state changes.
    chart.on("brushEnd", (event: unknown) => {
      const e = event as {
        areas?: { coordRange?: [[number, number], [number, number]] }[];
      };
      const areas = e.areas || [];
      const ids = valid
        .filter((p) =>
          areas.some((area) => {
            const r = area.coordRange;
            return (
              !!r &&
              p.price_usd! >= Math.min(...r[0]) &&
              p.price_usd! <= Math.max(...r[0]) &&
              p[weight]! >= Math.min(...r[1]) &&
              p[weight]! <= Math.max(...r[1])
            );
          }),
        )
        .map((p) => p.product_id);
      onSelect(ids);
    });
    const resize = new ResizeObserver(() => chart.resize());
    resize.observe(ref.current!);
    return () => {
      resize.disconnect();
      chart.dispose();
    };
  }, [rows, weight, selected, onSelect]);
  return (
    <div
      ref={ref}
      className="chart"
      role="img"
      aria-label={`Price versus ${weight === "minimum_weight_g" ? "minimum" : "packed"} weight scatter. Naturehike triangles; other offers circles. Use the linked table checkboxes for equivalent selection.`}
    />
  );
}
