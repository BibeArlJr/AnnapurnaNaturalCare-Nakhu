import Container from "@/components/Container";
import PackageListWithFilters from "@/components/packages/PackageListWithFilters";
import { apiGet } from "@/lib/api";

export const metadata = {
  title: "Health Packages | Annapurna Nature Cure Hospital",
  description: "Curated wellness and treatment packages tailored to holistic healing.",
};

export const revalidate = 0;

export default async function PackagesPage() {
  let packages = [];
  let departments = [];
  let treatmentTypes = [];

  try {
    const res = await apiGet("/packages");
    packages = res?.data || res || [];
  } catch (err) {
    console.error("Packages load error:", err);
  }

  try {
    const depRes = await apiGet("/departments");
    departments = depRes?.data || depRes || [];
  } catch (err) {
    console.error("Departments load error:", err);
  }

  try {
    const ttRes = await apiGet("/treatment-types");
    treatmentTypes = ttRes?.data || ttRes || [];
  } catch (err) {
    console.error("Treatment types load error:", err);
  }

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <Container className="py-14 md:py-18 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Health Packages</h1>
          <p className="text-base md:text-lg text-[#4c5f68] max-w-3xl">
            Curated wellness and treatment programs designed to restore balance, support recovery, and
            guide your holistic healing journey.
          </p>
        </header>

        {(!packages || packages.length === 0) ? (
          <div className="bg-white border border-[#dfe8e2] rounded-2xl p-8 text-[#4c5f68]">
            Packages will be available soon. Please contact us for customized programs.
          </div>
        ) : (
          <PackageListWithFilters
            packages={packages}
            departments={departments}
            treatmentTypes={treatmentTypes}
          />
        )}
      </Container>
    </div>
  );
}
