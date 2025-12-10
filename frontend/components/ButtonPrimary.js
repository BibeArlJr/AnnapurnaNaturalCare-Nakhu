export default function ButtonPrimary({ href, children }) {
  return (
    <a
      href={href}
      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition font-medium"
    >
      {children}
    </a>
  );
}
