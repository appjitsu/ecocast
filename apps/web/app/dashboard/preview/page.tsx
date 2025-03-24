'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { useState } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';

export default function PreviewPage() {
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Podcast</h1>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Podcast'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>News Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="p-2 border rounded-md"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="politics">Politics</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="science">Science</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Selected Articles</h3>
                  <span className="text-sm text-muted-foreground">
                    5 articles selected
                  </span>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-3 bg-muted rounded-lg flex items-start gap-3"
                    >
                      <input type="checkbox" className="mt-1" defaultChecked />
                      <div>
                        <h4 className="font-medium">Article Title {i}</h4>
                        <p className="text-sm text-muted-foreground">
                          Source • 2 min read
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Podcast Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Podcast Title</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Daily News Roundup"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Voice Style</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>Professional News Anchor</option>
                  <option>Casual Conversational</option>
                  <option>Educational</option>
                  <option>Entertainment</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Background Music</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>None</option>
                  <option>Subtle News Theme</option>
                  <option>Upbeat Background</option>
                  <option>Calm Ambient</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Script Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Introduction</h3>
                  <span className="text-sm text-muted-foreground">
                    0:00 - 0:30
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Welcome to your daily news roundup. Today's top stories
                  include...
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Story {i}</h3>
                    <span className="text-sm text-muted-foreground">
                      0:30 - 1:30
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    In our first story, we look at...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
