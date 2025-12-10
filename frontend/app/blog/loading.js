export default function Loading() {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 rounded" />
      ))}
    </div>
  );
}
