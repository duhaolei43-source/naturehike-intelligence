"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sources, grams, money } from "@/lib/data";
import type { Product } from "@/lib/schema";
export function Evidence({
  product,
  children,
}: {
  product: Product;
  children?: React.ReactNode;
}) {
  const source = sources.find((s) => s.source_id === product.source_id)!;
  return (
    <Dialog>
      <DialogTrigger className="text-button">
        {children || "Inspect source"}
      </DialogTrigger>
      <DialogContent className="evidence-drawer">
        <DialogHeader>
          <DialogTitle>{product.product_name} · field evidence</DialogTitle>
          <DialogDescription>
            {product.product_variant}. Verified attribution; completeness and
            physical performance are separate.
          </DialogDescription>
        </DialogHeader>
        <p className="eyebrow">
          {source.publisher} / {product.listing_type.replaceAll("_", " ")}
        </p>
        <a href={source.url} target="_blank" rel="noreferrer">
          Open official listing ↗
        </a>
        <p>Observed {product.price_observed_at_utc} UTC</p>
        <dl className="evidence-list">
          {Object.entries(product.field_evidence).map(([key, value]) => (
            <div key={key}>
              <dt>
                {key.replaceAll("_", " ")} ·{" "}
                {key === "price_usd"
                  ? money(product.price_usd)
                  : key === "minimum_weight_g"
                    ? grams(product.minimum_weight_g)
                    : key === "packed_weight_g"
                      ? grams(product.packed_weight_g)
                      : "reported field"}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <details>
          <summary>
            Missing field reasons ({Object.keys(product.missing_reasons).length}
            )
          </summary>
          <dl>
            {Object.entries(product.missing_reasons).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </details>
        <p>{product.weight_definition}</p>
        <p className="note">{product.notes}</p>
        <p>
          Source ID: <code>{source.source_id}</code>
        </p>
        <details>
          <summary>Provenance hash and limitations</summary>
          <p className="hash">{source.evidence_sha256}</p>
          <p>
            Identifier for a private structured extraction record. The private
            capture is not a downloadable public artifact.
          </p>
          {source.limitations.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </details>
      </DialogContent>
    </Dialog>
  );
}
