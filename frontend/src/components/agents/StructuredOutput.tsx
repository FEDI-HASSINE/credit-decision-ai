type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

interface Props {
  value: JSONValue;
  depth?: number;
  maxItems?: number;
}

const isPrimitive = (value: JSONValue) =>
  value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";

export const StructuredOutput = ({ value, depth = 0, maxItems = 8 }: Props) => {
  if (isPrimitive(value)) {
    return <span>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    const items = value.slice(0, maxItems);
    return (
      <ul style={{ paddingLeft: 16, margin: "6px 0" }}>
        {items.map((item, idx) => (
          <li key={`${depth}-${idx}`} style={{ color: "#475569" }}>
            <StructuredOutput value={item as JSONValue} depth={depth + 1} maxItems={maxItems} />
          </li>
        ))}
        {value.length > maxItems && (
          <li style={{ color: "#94a3b8" }}>… {value.length - maxItems} éléments supplémentaires</li>
        )}
      </ul>
    );
  }

  const entries = Object.entries(value as Record<string, JSONValue>);
  const clipped = entries.slice(0, maxItems);

  return (
    <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
      {clipped.map(([key, val]) => (
        <div key={`${depth}-${key}`} style={{ display: "grid", gap: 4 }}>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{key}</div>
          <div style={{ color: "#475569", paddingLeft: 12 }}>
            <StructuredOutput value={val as JSONValue} depth={depth + 1} maxItems={maxItems} />
          </div>
        </div>
      ))}
      {entries.length > maxItems && (
        <div style={{ color: "#94a3b8" }}>… {entries.length - maxItems} champs supplémentaires</div>
      )}
    </div>
  );
};
