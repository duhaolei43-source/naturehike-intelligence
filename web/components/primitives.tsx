import type { ReactNode } from "react";
import { manifest, money, grams, brands } from "@/lib/data";
import type { Product } from "@/lib/schema";
import { Evidence } from "./evidence";
import { PinButton } from "./shortlist";
export function PageIntro({
  number,
  kicker,
  title,
  children,
}: {
  number: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="eyebrow">
        FIELD GUIDE {number} / {kicker}
      </div>
      <h1>{title}</h1>
      <div className="intro-copy">{children}</div>
    </section>
  );
}
export function Badge({
  children,
  tone = "observed",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Coverage() {
  const q = manifest.coverage;
  return (
    <section className="coverage" aria-label="Dataset coverage">
      <div>
        <strong>{q.product_count}</strong>
        <span>selected variants</span>
      </div>
      <div>
        <strong>{q.brand_count}</strong>
        <span>brands</span>
      </div>
      <div>
        <strong>{q.product_count - q.missing_price_count}</strong>
        <span>bound USD prices</span>
      </div>
      <div>
        <strong>0</strong>
        <span>real demand batches</span>
      </div>
      <p>
        Observed 13 Oct 2026
        <br />
        Convenience sample · {manifest.dataset_version}
      </p>
    </section>
  );
}
export function DualWeight({ product }: { product: Product }) {
  const min = product.minimum_weight_g,
    pack = product.packed_weight_g,
    max = Math.max(min || 0, pack || 0, 1);
  return (
    <figure className="weight-figure">
      <figcaption>Reported weights · {product.product_name}</figcaption>
      <svg
        viewBox="0 0 500 116"
        role="img"
        aria-label={`Minimum ${grams(min)}; packed ${grams(pack)}. Reported manufacturer specifications.`}
      >
        <line
          x1="110"
          x2="465"
          y1="40"
          y2="40"
          stroke="#d4e1e8"
          strokeWidth="5"
        />
        <line
          x1="110"
          x2="465"
          y1="87"
          y2="87"
          stroke="#d4e1e8"
          strokeWidth="5"
        />
        <text x="0" y="45">
          Minimum
        </text>
        <text x="0" y="92">
          Packed
        </text>
        {[
          [min, 40, "#157a80"],
          [pack, 87, "#a85f08"],
        ].map(([v, y, c], i) =>
          v !== null ? (
            <g key={i}>
              <line
                x1="110"
                x2={110 + (Number(v) / max) * 275}
                y1={Number(y)}
                y2={Number(y)}
                stroke={String(c)}
                strokeWidth="5"
              />
              <circle
                cx={110 + (Number(v) / max) * 275}
                cy={Number(y)}
                r="7"
                fill={String(c)}
              />
              <text
                x={Math.min(110 + (Number(v) / max) * 275 + 12, 404)}
                y={Number(y) + 5}
              >
                {Math.round(Number(v))} g
              </text>
            </g>
          ) : (
            <text key={i} x="124" y={Number(y) + 5}>
              Not verified
            </text>
          ),
        )}
      </svg>
      <p>
        Minimum/trail and packed/packaged labels are preserved. Included
        components may differ by brand.
      </p>
    </figure>
  );
}
export function ProductCard({
  product,
  selected = false,
}: {
  product: Product;
  selected?: boolean;
}) {
  return (
    <article className={`product-card ${selected ? "selected" : ""}`}>
      <div className="product-topline">
        <span>{brands[product.brand_id]}</span>
        <Badge>
          {product.price_type === "sale" ? "Observed sale" : "Observed"}
        </Badge>
      </div>
      <h3>
        <a href={`/products/${product.product_id}/`}>{product.product_name}</a>
      </h3>
      <p className="variant">{product.product_variant}</p>
      <div className="product-numbers">
        <strong>{money(product.price_usd)}</strong>
        <span>{grams(product.minimum_weight_g)} minimum</span>
      </div>
      <p>
        Footprint:{" "}
        {product.footprint_included === null
          ? "not verified"
          : product.footprint_included
            ? "included"
            : "excluded"}{" "}
        · {product.availability.replaceAll("_", " ")}
      </p>
      <div className="card-actions">
        <Evidence product={product} />
        <PinButton id={product.product_id} />
      </div>
    </article>
  );
}
