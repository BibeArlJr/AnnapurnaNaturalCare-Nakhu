"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import AddGalleryModal from "@/components/admin/AddGalleryModal";

export default function EditGalleryPage({ params }) {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await apiGet(`/gallery/${params.id}`);
        setItem(res?.data || res || null);
      } catch (err) {
        setError("Media not found");
      }
    }
    loadItem();
  }, [params.id]);

  return (
    <AddGalleryModal
      open
      initialData={item}
      onClose={() => router.push("/admin/gallery")}
      onSaved={() => router.push("/admin/gallery")}
      key={item?._id || "missing"}
    >
      {error && <div className="text-rose-400">{error}</div>}
    </AddGalleryModal>
  );
}
