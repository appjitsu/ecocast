'use client';

import {
  CAST_CATEGORIES,
  CAST_STATUSES,
  CAST_VOICES,
  Cast,
  CastCategory,
  CastStatus,
  CreateCastForm,
} from '@repo/types';
import { useToast } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../../components/ProtectedRoute';
import { fetchWithAuth } from '../../../../lib/auth/fetchWithAuth';

// This is a Client Component that receives params from the Server Component (page.tsx)
function EditCastClient({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState<CreateCastForm>({
    title: '',
    castCategory: CastCategory.NEWS,
    slug: '',
    status: CastStatus.DRAFT,
  });

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/casts/${id}`,
        );

        if (response.ok) {
          const data: Cast = await response.json();
          setForm({
            title: data.title,
            castCategory: data.castCategory,
            slug: data.slug,
            status: data.status,
            content: data.content,
            voice: data.voice,
            voiceOverUrl: data.voiceOverUrl,
            featuredImageUrl: data.featuredImageUrl,
            scheduledFor: data.scheduledFor,
          });
        } else {
          throw new Error('Failed to fetch cast');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        });
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCast();
  }, [id, router, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/casts/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        },
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Cast updated successfully',
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update cast',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev: CreateCastForm) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setForm((prev: CreateCastForm) => ({
      ...prev,
      title,
      slug,
    }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-foreground">Edit Cast</h1>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CAST_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() +
                          category.slice(1).replace(/-/g, ' ')}
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CAST_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a voice</option>
                    {CAST_VOICES.map((voice) => (
                      <option key={voice} value={voice}>
                        {voice.charAt(0).toUpperCase() + voice.slice(1)}
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 rounded-md border hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// This is the Server Component that will be the actual page
export default async function EditCastPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditCastClient id={params.id} />;
}
