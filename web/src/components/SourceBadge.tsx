type Props = { source: string };
export function SourceBadge({ source }: Props) {
  return (
    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
      Source: {source}
    </span>
  );
}
