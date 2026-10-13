"use client";
import { useAtlas } from "./atlas-provider";
import { products } from "@/lib/data";
import { serialize } from "@/lib/analysis";
export function PinButton({ id }: { id: string }) {
  const { scope, toggleCompare } = useAtlas();
  return (
    <button
      className="pin-button"
      aria-pressed={scope.compare.includes(id)}
      onClick={() => toggleCompare(id)}
    >
      {scope.compare.includes(id) ? "Remove from compare" : "+ Compare"}
    </button>
  );
}
export function CompareTray() {
  const { scope, toggleCompare, notice } = useAtlas();
  if (!scope.compare.length && !notice) return null;
  return (
    <aside className="compare-tray" aria-label="Comparison shortlist">
      {notice && <p role="status">{notice}</p>}
      {scope.compare.length > 0 && (
        <>
          <div>
            <strong>{scope.compare.length}/4 pinned</strong>
            <span>Public IDs saved on this device.</span>
          </div>
          <ul>
            {scope.compare.map((id) => (
              <li key={id}>
                {products.find((p) => p.product_id === id)?.product_name}
                <button
                  onClick={() => toggleCompare(id)}
                  aria-label={`Remove ${id} from shortlist`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <a className="button small" href={"/compare/" + serialize(scope)}>
            Compare selection →
          </a>
        </>
      )}
    </aside>
  );
}
