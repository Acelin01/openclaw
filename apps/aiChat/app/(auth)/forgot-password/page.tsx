"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthLayout, Input, Button, Label } from "@uxin/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  const renderForm = (isMobile: boolean) => (
    <div className="w-full">
        {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#222325] font-medium">Email Address</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 border-[#e4e5e7] focus:border-[#1dbf73] focus:ring-[#1dbf73]"
                        required 
                    />
                </div>
                <Button 
                    type="submit" 
                    className="w-full bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold h-10 text-[16px] mt-2"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Reset Password"}
                </Button>
                <div className="text-center text-sm text-[#62646a] mt-4">
                    Remember your password?{' '}
                    <Link href="/login" className="text-[#1dbf73] font-medium hover:underline">
                        Sign in
                    </Link>
                </div>
            </form>
        ) : (
            <div className="text-center">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">
                    If an account exists for <strong>{email}</strong>, we have sent a password reset link to it.
                </div>
                <Link href="/login" className="text-[#1dbf73] font-medium hover:underline">
                    Back to Sign in
                </Link>
            </div>
        )}
    </div>
  );

  return (
    <AuthLayout
      renderForm={renderForm}
      title="Reset Password"
      subtitle="Enter your email to reset your password"
      appName="UxIn"
      promoTitle="Secure Account Recovery"
      promoFeatures={[
        "Quick Recovery",
        "Secure Process",
        "24/7 Support"
      ]}
    />
  );
}
