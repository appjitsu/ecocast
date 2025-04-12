import { CastCategory, CastStatus, CastVoice } from '@repo/types';
import { Button } from '@repo/ui';
import { capitalize } from '@repo/utils';
import { useState } from 'react';

interface CreateCastFormProps {
  onSubmit: (data: {
    title: string;
    castCategory: CastCategory;
    status: CastStatus;
    content: string;
    voice: CastVoice;
  }) => Promise<void>;
  onCancel: () => void;
}

export function CreateCastForm({ onSubmit, onCancel }: CreateCastFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    castCategory: CastCategory.NEWS,
    status: CastStatus.DRAFT,
    content: '',
    voice: CastVoice.JOHN,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to create cast. Please try again.');
      console.error('Error creating cast:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter cast title"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="castCategory" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="castCategory"
          name="castCategory"
          value={formData.castCategory}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          {Object.values(CastCategory).map((category) => (
            <option key={category} value={category}>
              {capitalize(category)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="voice" className="block text-sm font-medium">
          Voice
        </label>
        <select
          id="voice"
          name="voice"
          value={formData.voice}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          {Object.values(CastVoice).map((voice) => (
            <option key={voice} value={voice}>
              {capitalize(voice)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter cast content"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? 'Creating...' : 'Create Cast'}
        </Button>
      </div>
    </form>
  );
}
