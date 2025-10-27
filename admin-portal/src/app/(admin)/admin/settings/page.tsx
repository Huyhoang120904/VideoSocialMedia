"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Shield,
  Bell,
  Palette,
  Database,
  Globe,
  Save,
  Download,
  Archive,
} from "lucide-react";
import {
  settingsService,
  PlatformSettings,
} from "@/services/admin/settingsService";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await settingsService.getSettings();
        if (response.code === 1000 && response.result) {
          setSettings(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await settingsService.updateSettings(settings);
      if (response.code === 1000) {
        toast.success("Settings saved successfully");
        setSettings(response.result);
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await settingsService.exportData();
      if (response.code === 1000) {
        toast.success("Data export completed. Download will start shortly.");
        // In a real implementation, you would trigger the download here
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackingUp(true);
      const response = await settingsService.createBackup();
      if (response.code === 1000) {
        toast.success("Backup created successfully");
      } else {
        toast.error("Failed to create backup");
      }
    } catch (error) {
      console.error("Failed to create backup:", error);
      toast.error("Failed to create backup");
    } finally {
      setBackingUp(false);
    }
  };

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                        <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                      </div>
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your platform settings and preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable platform access
                </p>
              </div>
              <Switch
                id="maintenance-mode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  updateSetting("maintenanceMode", checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (seconds)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  updateSetting("sessionTimeout", parseInt(e.target.value))
                }
                placeholder="3600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-registration">Enable Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new user registrations
                </p>
              </div>
              <Switch
                id="enable-registration"
                checked={settings.enableRegistration}
                onCheckedChange={(checked) =>
                  updateSetting("enableRegistration", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) =>
                  updateSetting("enableEmailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Browser push notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.enablePushNotifications}
                onCheckedChange={(checked) =>
                  updateSetting("enablePushNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-alerts">SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Critical alerts via SMS
                </p>
              </div>
              <Switch
                id="sms-alerts"
                checked={settings.enableSMSAlerts}
                onCheckedChange={(checked) =>
                  updateSetting("enableSMSAlerts", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  updateSetting("theme", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={settings.timezone}
                onChange={(e) => updateSetting("timezone", e.target.value)}
                placeholder="UTC"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage data and backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention (days)</Label>
              <Input
                id="data-retention"
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) =>
                  updateSetting("dataRetentionDays", parseInt(e.target.value))
                }
                placeholder="365"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Export</p>
                <p className="text-sm text-muted-foreground">
                  Export platform data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Create Backup</p>
                <p className="text-sm text-muted-foreground">
                  Create system backup
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateBackup}
                disabled={backingUp}
              >
                <Archive className="mr-2 h-4 w-4" />
                {backingUp ? "Creating..." : "Backup"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Configuration
          </CardTitle>
          <CardDescription>
            Global platform settings and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input
              id="platform-name"
              value={settings.platformName}
              onChange={(e) => updateSetting("platformName", e.target.value)}
              placeholder="TikTok Clone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-file-size">Max File Size (bytes)</Label>
            <Input
              id="max-file-size"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) =>
                updateSetting("maxFileSize", parseInt(e.target.value))
              }
              placeholder="20971520"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-rate-limit">
              API Rate Limit (requests/hour)
            </Label>
            <Input
              id="api-rate-limit"
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) =>
                updateSetting("apiRateLimit", parseInt(e.target.value))
              }
              placeholder="1000"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
