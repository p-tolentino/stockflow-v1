"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      toast.error("Error", { description: error.message });
    } else {
      toast.success("Success", {
        description: "Check your email for confirmation link.",
      });
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 font-sans">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative coffee ring stains */}
      <div
        className="absolute top-20 left-20 h-32 w-32 rounded-full bg-amber-200/20 blur-2xl animate-pulse"
        style={{ animationDuration: "4s" }}
      />
      <div
        className="absolute bottom-32 right-32 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl animate-pulse"
        style={{ animationDuration: "5s", animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-rose-200/20 blur-2xl animate-pulse"
        style={{ animationDuration: "6s", animationDelay: "2s" }}
      />

      <div className="relative w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Decorative top element */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-amber-400 to-orange-500 blur-lg opacity-40 rounded-full" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-orange-600 shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-10 w-10 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                />
              </svg>
            </div>
          </div>
        </div>

        <Card className="border-amber-200/50 bg-white/80 backdrop-blur-sm shadow-2xl shadow-amber-900/10">
          <CardHeader className="space-y-3 text-center pb-8">
            <CardTitle className="text-3xl font-bold text-amber-900 tracking-tight">
              Get Started
            </CardTitle>
            <CardDescription className="text-base text-amber-800/70 font-medium">
              Create your account to begin managing inventory
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignup}>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-amber-900 uppercase tracking-wide"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="h-12 border-2 border-amber-200 bg-white text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-amber-900 uppercase tracking-wide"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="h-12 border-2 border-amber-200 bg-white text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-amber-900 uppercase tracking-wide"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 border-2 border-amber-200 bg-white text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 rounded-lg"
                  required
                />
                <p className="text-xs text-amber-700/70 mt-2">
                  Must be at least 6 characters long
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-5 pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-900/25 hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-amber-800/80">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-amber-700 hover:text-amber-900 transition-colors underline-offset-4 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Decorative bottom element */}
        <div className="mt-8 flex justify-center gap-1.5 opacity-40">
          <div
            className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse"
            style={{ animationDuration: "2s" }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.3s" }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.6s" }}
          />
        </div>
      </div>
    </div>
  );
}
