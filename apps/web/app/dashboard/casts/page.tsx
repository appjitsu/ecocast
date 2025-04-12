'use client';

import { Cast, CastStatus } from '@repo/types';
import { Button } from '@repo/ui';
import { jwtDecode } from 'jwt-decode';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';
import { CreateCastModal } from './components/CreateCastModal';

interface JwtPayload {
  sub: string;
  exp: number;
}

export default function MyCastsPage() {
  const { isAuthenticated, accessToken } = useAuth();
  const router = useRouter();
  const [casts, setCasts] = useState<Cast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCasts = useCallback(async () => {
    if (!accessToken) {
      console.log('No access token available');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const userId = decoded.sub;
      console.log('Fetching casts for user:', userId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/casts/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log('API Response status:', response.status);
      const data = (await response.json()) as Cast[] | { data: Cast[] };
      console.log('API Response data:', data);

      if (!response.ok) {
        throw new Error('Failed to fetch casts');
      }

      // Ensure we have an array of casts
      const castsArray = Array.isArray(data) ? data : data.data || [];
      console.log('Processed casts array:', castsArray);
      setCasts(castsArray);
    } catch (error) {
      console.error('Error fetching casts:', error);
      setError('Failed to load casts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, fetching casts...');
      fetchCasts();
    } else {
      console.log('User is not authenticated');
    }
  }, [isAuthenticated, accessToken, fetchCasts]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: CastStatus) => {
    switch (status) {
      case CastStatus.PUBLISHED:
        return 'bg-green-100 text-green-800';
      case CastStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case CastStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case CastStatus.PREVIEW:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading casts...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Casts</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 border flex items-center"
          size="default"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create New Cast
        </Button>
      </div>

      <CreateCastModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCasts}
      />

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">
                Title
              </th>
              <th className="hidden md:table-cell h-12 px-4 text-left align-middle font-medium">
                Category
              </th>
              <th className="hidden lg:table-cell h-12 px-4 text-left align-middle font-medium">
                Voice
              </th>
              <th className="hidden sm:table-cell h-12 px-4 text-left align-middle font-medium">
                Created
              </th>
              <th className="hidden md:table-cell h-12 px-4 text-left align-middle font-medium">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {casts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No casts found. Create your first cast to get started!
                </td>
              </tr>
            ) : (
              casts.map((cast) => (
                <tr key={cast.id} className="border-b">
                  <td className="p-4 align-middle">{cast.title}</td>
                  <td className="hidden md:table-cell p-4 align-middle capitalize">
                    {cast.castCategory}
                  </td>
                  <td className="hidden lg:table-cell p-4 align-middle capitalize">
                    {cast.voice}
                  </td>
                  <td className="hidden sm:table-cell p-4 align-middle">
                    {new Date(cast.createdAt).toLocaleDateString()}
                  </td>
                  <td className="hidden md:table-cell p-4 align-middle">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        cast.status,
                      )}`}
                    >
                      {cast.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          router.push(`/dashboard/casts/${cast.id}`)
                        }
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          router.push(`/dashboard/casts/${cast.id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
