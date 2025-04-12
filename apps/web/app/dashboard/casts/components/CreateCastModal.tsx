import { CastCategory, CastStatus, CastVoice } from '@repo/types';
import { Button } from '@repo/ui';
import { X } from 'lucide-react';
import { useAuth } from '../../../../lib/auth/AuthContext';
import { CreateCastForm } from './CreateCastForm';

interface CreateCastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CastFormData {
  title: string;
  castCategory: CastCategory;
  status: CastStatus;
  content: string;
  voice: CastVoice;
}

export function CreateCastModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCastModalProps) {
  const { accessToken } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (formData: CastFormData) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/casts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to create cast');
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Cast</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">
          <CreateCastForm onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
