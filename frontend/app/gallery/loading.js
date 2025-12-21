import Container from "@/components/Container";

export default function Loading() {
  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <Container className="py-12 md:py-16 space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-[#dfe8e2] rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-[#e8f0ea] rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-[#e8f0ea] rounded-xl border border-[#dfe8e2]" />
          ))}
        </div>
      </Container>
    </div>
  );
}
