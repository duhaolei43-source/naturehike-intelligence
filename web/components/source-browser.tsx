"use client";
import { useState } from "react";
import { products, brands } from "@/lib/data";
import { Evidence } from "./evidence";
export function SourceBrowser() {
  const [query, setQuery] = useState(""),
    [brand, setBrand] = useState("all");
  const rows = products.filter(
    (p) =>
      (brand === "all" || p.brand_id === brand) &&
      `${p.product_name} ${p.product_variant} ${p.source_id} ${p.vendor_name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="panel">
      <p className="eyebrow">PUBLIC SOURCE BROWSER</p>
      <h2>Find the field behind the fact.</h2>
      <div className="button-group">
        <label>
          Search sources
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Product, source ID or publisher"
          />
        </label>
        <label>
          Source brand
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="all">All brands</option>
            {Object.entries(brands).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p aria-live="polite">{rows.length} source-linked records</p>
      <div className="source-list">
        {rows.map((p) => (
          <article key={p.product_id}>
            <h3>{p.product_name}</h3>
            <p>
              {p.product_variant} · publisher {p.vendor_name} ·{" "}
              {p.listing_type.replaceAll("_", " ")}
            </p>
            <code>{p.source_id}</code>
            <Evidence product={p} />
          </article>
        ))}
      </div>
    </section>
  );
}
