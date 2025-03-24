'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../../lib/auth/AuthContext';

export default function NewPodcastPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'all',
    voiceStyle: 'professional',
    duration: '10',
    backgroundMusic: 'none',
  });

  if (!isAuthenticated) {
    return null;
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Navigate to preview page with form data
      router.push('/dashboard/preview');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Podcast Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Daily News Roundup"
              />
            </div>
            <div>
              <label className="text-sm font-medium">News Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="politics">Politics</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="science">Science</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Voice Style</label>
              <select
                value={formData.voiceStyle}
                onChange={(e) =>
                  setFormData({ ...formData, voiceStyle: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="professional">Professional News Anchor</option>
                <option value="casual">Casual Conversational</option>
                <option value="educational">Educational</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Background Music</label>
              <select
                value={formData.backgroundMusic}
                onChange={(e) =>
                  setFormData({ ...formData, backgroundMusic: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="none">None</option>
                <option value="subtle">Subtle News Theme</option>
                <option value="upbeat">Upbeat Background</option>
                <option value="calm">Calm Ambient</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Summary</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Title: {formData.title}</p>
                <p>Date: {new Date(formData.date).toLocaleDateString()}</p>
                <p>Category: {formData.category}</p>
                <p>Voice Style: {formData.voiceStyle}</p>
                <p>Duration: {formData.duration} minutes</p>
                <p>Background Music: {formData.backgroundMusic}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Podcast</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {step === 3 ? 'Create & Preview' : 'Next'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1
              ? 'Basic Information'
              : step === 2
                ? 'Podcast Settings'
                : 'Review'}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
}
