'use client';

import {
  CAST_CATEGORIES,
  CAST_STATUSES,
  CAST_VOICES,
  CreateCastForm,
} from '@repo/types';
import { Button } from '@repo/ui';
import { capitalize, slugify } from '@repo/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { apiPost } from '../../../lib/api/fetch-helpers';

export default function CreateCastPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CreateCastForm>({
    title: '',
    castCategory: CAST_CATEGORIES[0],
    slug: '',
    status: CAST_STATUSES[0],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await apiPost(
        `${process.env.NEXT_PUBLIC_API_URL}/casts`,
        form,
      );

      if (error) {
        toast.error(error);
      } else {
        toast.success('Cast created successfully');
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = slugify(title);

    setForm((prev: CreateCastForm) => ({
      ...prev,
      title,
      slug,
    }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Create New Cast
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-foreground"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={form.title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                  placeholder="Enter cast title"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="slug"
                  className="text-sm font-medium text-foreground"
                >
                  Slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                  placeholder="enter-slug"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="castCategory"
                  className="text-sm font-medium text-foreground"
                >
                  Category
                </label>
                <select
                  id="castCategory"
                  name="castCategory"
                  required
                  value={form.castCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                >
                  {CAST_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {capitalize(category.replace(/-/g, ' '))}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-foreground"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                >
                  {CAST_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {capitalize(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="content"
                  className="text-sm font-medium text-foreground"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                  placeholder="Enter cast content"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="voice"
                  className="text-sm font-medium text-foreground"
                >
                  Voice
                </label>
                <select
                  id="voice"
                  name="voice"
                  value={form.voice || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                >
                  <option value="">Select a voice</option>
                  {CAST_VOICES.map((voice) => (
                    <option key={voice} value={voice}>
                      {capitalize(voice)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="voiceOverUrl"
                  className="text-sm font-medium text-foreground"
                >
                  Voice Over URL
                </label>
                <input
                  id="voiceOverUrl"
                  name="voiceOverUrl"
                  type="url"
                  value={form.voiceOverUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                  placeholder="https://example.com/voice.mp3"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="featuredImageUrl"
                  className="text-sm font-medium text-foreground"
                >
                  Featured Image URL
                </label>
                <input
                  id="featuredImageUrl"
                  name="featuredImageUrl"
                  type="url"
                  value={form.featuredImageUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="scheduledFor"
                  className="text-sm font-medium text-foreground"
                >
                  Schedule For
                </label>
                <input
                  id="scheduledFor"
                  name="scheduledFor"
                  type="datetime-local"
                  value={form.scheduledFor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? 'Creating...' : 'Create Cast'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
