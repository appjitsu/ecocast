'use client';

import { Cast } from '@repo/types';
import { useToast } from '@repo/ui';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../../components/ProtectedRoute';
import { fetchWithAuth } from '../../../../lib/auth/fetchWithAuth';

export default function PreviewCastPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [cast, setCast] = useState<Cast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/casts/${params.id}`,
        );

        if (response.ok) {
          const data = await response.json();
          setCast(data);
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
  }, [params.id, router, toast]);

  const getStatusColor = (status: Cast['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'preview':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-foreground">Cast Details</h1>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : cast ? (
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-8 space-y-6">
              {cast.featuredImageUrl && (
                <div className="relative h-64 w-full">
                  <Image
                    src={cast.featuredImageUrl}
                    alt={cast.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{cast.title}</h2>
                    <p className="text-muted-foreground mt-1">
                      {cast.castCategory}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      cast.status,
                    )}`}
                  >
                    {cast.status}
                  </span>
                </div>

                {cast.content && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Content</h3>
                    <p className="whitespace-pre-wrap">{cast.content}</p>
                  </div>
                )}

                {cast.voice && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Voice</h3>
                    <p className="text-muted-foreground">
                      {cast.voice.charAt(0).toUpperCase() + cast.voice.slice(1)}
                    </p>
                  </div>
                )}

                {cast.voiceOverUrl && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Voice Over</h3>
                    <audio
                      controls
                      className="w-full"
                      src={cast.voiceOverUrl}
                    />
                  </div>
                )}

                {cast.scheduledFor && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Scheduled For
                    </h3>
                    <p className="text-muted-foreground">
                      {new Date(cast.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex justify-end space-x-4">
                  <button
                    onClick={() => router.push(`/dashboard/edit/${cast.id}`)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
                  >
                    Edit Cast
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Cast not found
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
