"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Sparkles, TrendingUp, Bell, Lock, Palette } from "lucide-react"

function SettingsPageContent() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-400" />
              Profile Information
            </CardTitle>
            <CardDescription>
              View and update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={user.first_name}
                  readOnly
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={user.last_name}
                  readOnly
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                readOnly
                className="bg-background/50"
              />
            </div>
            {user.profile?.zodiac_sign && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Zodiac Sign
                </Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20">
                  <span className="text-2xl">{user.profile.zodiac_symbol}</span>
                  <div>
                    <p className="font-medium">{user.profile.zodiac_sign}</p>
                    <p className="text-sm text-muted-foreground">{user.profile.zodiac_element} Element</p>
                  </div>
                </div>
              </div>
            )}
            {user.profile?.date_of_birth && (
              <div className="space-y-2">
                <Label htmlFor="dob" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  value={user.profile.date_of_birth}
                  readOnly
                  className="bg-background/50"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Preferences */}
        <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Investment Preferences
            </CardTitle>
            <CardDescription>
              Configure your trading and investment settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.profile?.investing_style && (
              <div className="space-y-2">
                <Label>Investing Style</Label>
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20">
                  <p className="font-medium capitalize">{user.profile.investing_style}</p>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              More investment preferences coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification settings coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-400" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Theme preferences are managed via the theme toggle in the navigation bar.
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-400" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full md:w-auto" disabled>
              Change Password
            </Button>
            <p className="text-sm text-muted-foreground">
              Security features coming soon...
            </p>
          </CardContent>
        </Card>

        <Separator className="bg-purple-500/20" />

        {/* Footer Actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-purple-500/30 hover:bg-purple-800/30"
          >
            Go Back
          </Button>
          <p className="text-xs text-muted-foreground">
            Account created: {new Date(user.date_joined).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  )
}

