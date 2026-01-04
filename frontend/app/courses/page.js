"use client";

import CoursesListContent from "./CoursesListContent";

export default function CoursesPage({ searchParams }) {
  const initialCategorySlug = searchParams?.category || "";
  return <CoursesListContent initialCategorySlug={initialCategorySlug} />;
}
