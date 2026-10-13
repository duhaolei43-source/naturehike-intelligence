import raw from "@/public/data/products.json";
import registry from "@/public/data/sources.json";
import { productsSchema, sourcesSchema } from "./schema";
export const products = productsSchema.parse(raw);
export const sources = sourcesSchema.parse(registry);
export { default as manifest } from "@/public/data/manifest.json";
export { default as findings } from "@/public/data/findings.json";
export const brands: Record<string, string> = {
  naturehike: "Naturehike",
  rei: "REI Co-op",
  kelty: "Kelty",
  msr: "MSR",
  "big-agnes": "Big Agnes",
  nemo: "NEMO",
  "mountain-hardwear": "Mountain Hardwear",
  "the-north-face": "The North Face",
  tarptent: "Tarptent",
};
export const money = (v: number | null) =>
  v === null
    ? "Not verified"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(v);
export const grams = (v: number | null) =>
  v === null
    ? "Not verified"
    : `${Number(v.toFixed(1)).toLocaleString("en-US")} g`;
export const cohortLabel = (v: string) =>
  v === "all"
    ? "All offers · descriptive"
    : v
        .split("|")
        .map((s) =>
          s === "true"
            ? "footprint included"
            : s === "false"
              ? "footprint excluded"
              : s,
        )
        .join(" / ");
