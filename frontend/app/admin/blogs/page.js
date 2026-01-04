"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, NewspaperIcon, PlusIcon, TagIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { apiGet, apiDelete, apiPatch } from "@/lib/api";
import BlogCard from "@/components/admin/BlogCard";
import AddBlogModal from "@/components/admin/AddBlogModal";
import AddCategoryModal from "@/components/admin/AddCategoryModal";
import EditCategoryModal from "@/components/admin/EditCategoryModal";

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  async function loadPosts() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("/blogs?includeDrafts=true");
      const data = res?.data || res || [];
      setPosts(data);
      setFiltered(data);
    } catch (err) {
      console.error("Blog fetch error:", err);
      setError("Failed to load blogs");
    }
    setLoading(false);
  }

  async function loadCategories() {
    setCatLoading(true);
    try {
      const res = await apiGet("/blog/categories");
      const data = res?.data || res || [];
      setCategories(data);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
    setCatLoading(false);
  }

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  function handleSearch(text) {
    setSearch(text);
    const q = text.toLowerCase();
    const f = posts.filter((p) => {
      const cat = p?.categoryId?.name || p?.category || "";
      return (
        (p.title || "").toLowerCase().includes(q) ||
        (p.shortDescription || "").toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q)
      );
    });
    setFiltered(f);
  }

  async function handleDeletePost(id) {
    if (!confirm("Delete this post?")) return;
    try {
      await apiDelete(`/blogs/${id}`);
      loadPosts();
    } catch (err) {
      alert(err.message || "Failed to delete post");
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await apiDelete(`/blog/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setToast("Category deleted");
    } catch (err) {
      setToast(
        err.message ||
          "Cannot delete category until blogs are reassigned."
      );
    }
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  function syncStatus(id, status) {
    setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
    setFiltered((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
  }

  async function handleToggleStatus(post) {
    const nextStatus = post.status === "published" ? "draft" : "published";
    syncStatus(post._id, nextStatus);
    setStatusUpdatingId(post._id);
    try {
      await apiPatch(`/blogs/${post._id}/status`, {
        status: nextStatus,
      });
    } catch (err) {
      syncStatus(post._id, post.status);
      alert(err.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-white/10 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl text-white font-semibold flex items-center gap-2">
              <NewspaperIcon className="h-7 w-7 text-teal-400" />
              Manage Blog Posts
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                <TagIcon className="h-5 w-5 text-teal-300" />
                Manage Categories
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
              >
                <PlusIcon className="h-5 w-5" />
                Add New Post
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search posts..."
              className="bg-[#11151c] border border-white/10 text-white rounded-lg py-3 pl-10 pr-3 w-full outline-none focus:border-teal-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-slate-800 rounded-xl" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <NewspaperIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p>No blog posts found.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-block mt-4 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg transition"
              >
                Add First Post
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  onDelete={handleDeletePost}
                  onToggleStatus={handleToggleStatus}
                  updatingStatus={statusUpdatingId === post._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Categories Panel */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0f131a] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-teal-400" />
                <h2 className="text-sm font-semibold text-white">Categories</h2>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-white hover:bg-slate-700 transition"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </button>
            </div>
            {catLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-6">
                No categories yet.
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="rounded-xl border border-white/10 bg-[#11151c] p-3 hover:border-teal-600/40 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold text-sm">{cat.name}</p>
                        <p className="text-xs text-slate-400">/{cat.slug}</p>
                        {cat.createdAt && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            {new Date(cat.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setShowEditCategoryModal(true);
                          }}
                          className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4 text-teal-300" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-2 rounded-md bg-slate-800 hover:bg-rose-700 transition"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4 text-rose-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-3">
              Categories linked to posts cannot be deleted until reassigned.
            </p>
          </div>
        </aside>
      </div>

      <AddBlogModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => {
          setShowAddModal(false);
          loadPosts();
          loadCategories();
        }}
        categories={categories}
      />

      <AddCategoryModal
        open={showCategoryModal || showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setShowCategoryModal(false);
        }}
        onCategoryCreated={() => {
          setShowAddCategoryModal(false);
          setShowCategoryModal(false);
          loadCategories();
          setToast("Category added");
        }}
      />

      <EditCategoryModal
        open={showEditCategoryModal}
        category={editingCategory}
        onClose={() => {
          setShowEditCategoryModal(false);
          setEditingCategory(null);
        }}
        onCategoryUpdated={() => {
          setShowEditCategoryModal(false);
          setEditingCategory(null);
          loadCategories();
          setToast("Category updated");
        }}
      />
    </div>
  );
}
