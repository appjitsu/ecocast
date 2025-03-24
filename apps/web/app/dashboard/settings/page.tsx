'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { useState } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save functionality
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    Email Notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your content
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    Push Notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new features
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">API Key</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-md"
                    value="••••••••••••••••"
                    readOnly
                  />
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Webhook URL</label>
                <input
                  type="url"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="https://your-webhook-url.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
