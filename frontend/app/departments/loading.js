export default function Loading() {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded" />
      ))}
    </div>
  );
}
