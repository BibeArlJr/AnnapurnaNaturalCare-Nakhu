"use client";

import { useRouter } from "next/navigation";
import AddGalleryModal from "@/components/admin/AddGalleryModal";

export default function NewGalleryPage() {
  const router = useRouter();
  return (
    <AddGalleryModal
      open
      onClose={() => router.push("/admin/gallery")}
      onSaved={() => router.push("/admin/gallery")}
    />
  );
}
