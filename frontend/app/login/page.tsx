"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, Sparkles, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { login } from "@/lib/api/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password")
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const result = await login(formData)
      console.log("Login successful:", result)
      
      // Redirect to discovery page or dashboard
      router.push("/discovery")
    } catch (err: any) {
      console.error("Login failed:", err)
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-16 w-1 h-1 bg-secondary rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-primary rounded-full animate-pulse delay-500" />
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-secondary rounded-full animate-pulse delay-1000" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <div className="relative">
                <Star className="w-6 h-6 text-white" fill="currentColor" />
                <Sparkles className="w-3 h-3 text-accent absolute -top-0.5 -right-0.5" />
              </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-lg -z-10" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Continue your cosmic trading journey
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Aligning your stars...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:text-primary/80"
                onClick={() => router.push("/signup")}
              >
                Create one
              </Button>
            </p>
          </div>
        </Card>

        {/* Demo Mode */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => {
              // Set demo user data and redirect
              localStorage.setItem(
                "zenTraderUser",
                JSON.stringify({
                  name: "Demo User",
                  birthDate: "1990-09-15", // Virgo date
                  zodiacSign: "Virgo",
                  investingVibe: "Balanced",
                }),
              )
              router.push("/discovery")
            }}
            className="border-accent/50 text-accent hover:bg-accent/10 bg-transparent"
          >
            <Star className="w-4 h-4 mr-2" />
            Try Demo Mode
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/70 mt-6 text-center">
          Discover your trading destiny through the wisdom of the stars
        </p>
      </div>
    </div>
  )
}
