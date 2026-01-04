"use client";

import CoursesListContent from "../../CoursesListContent";

export default function CoursesByCategoryPage({ params }) {
  const slug = params?.categorySlug || "";
  return <CoursesListContent initialCategorySlug={slug} />;
}
