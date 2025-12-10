export default function Loading() {
  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded" />
      ))}
    </div>
  );
}
