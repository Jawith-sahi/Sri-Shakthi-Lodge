// Renders a JSON-LD block. The payload is built from our own data and serialised with JSON.stringify;
// "<" is escaped so the content can never close the <script> tag (the standard safe pattern).
export function JsonLd({ data }) {
  if (!data) return null;
  const items = Array.isArray(data) ? data.filter(Boolean) : [data];
  return items.map((item, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
    />
  ));
}
