export default function HomeSectionTitle({ title, subtitle }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-bold text-blue-900">{title}</h2>
      {subtitle ? (
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{subtitle}</p>
      ) : null}
    </div>
  );
}
