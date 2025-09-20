"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let success = false;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(
          formData.email,
          formData.password,
          formData.name
        );
      }

      if (success) {
        onSuccess();
      } else {
        setError(isLogin ? "Invalid email or password" : "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            {isLogin ? "Welcome back" : "Create account"}
          </CardTitle>
          <CardDescription className='text-center'>
            {isLogin
              ? "Sign in to your TaskMate account"
              : "Get started with TaskMate"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {!isLogin && (
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className='pl-10'
                    placeholder='Enter your full name'
                  />
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className='pl-10'
                  placeholder='Enter your email'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='password'
                  name='password'
                  type='password'
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className='pl-10'
                  placeholder='Enter your password'
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <button
              type='button'
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({ email: "", password: "", name: "" });
              }}
              className='text-sm text-blue-600 hover:text-blue-500'
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
