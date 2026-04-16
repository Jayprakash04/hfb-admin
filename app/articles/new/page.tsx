"use client";

import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import ArticleForm from "../../components/article/ArticleForm";

export default function NewArticlePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-55 min-w-0">
        <TopBar />
        <div className="px-6 py-6 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-black">New Article</h1>
              <p className="text-xs text-gray-500 mt-1">Fill in the details below to create a new article.</p>
            </div>
            <button
              onClick={() => router.push("/articles")}
              className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              ← Back to Articles
            </button>
          </div>
          <ArticleForm
            mode="create"
            onSuccess={() => router.push("/articles")}
          />
        </div>
      </div>
    </div>
  );
}
