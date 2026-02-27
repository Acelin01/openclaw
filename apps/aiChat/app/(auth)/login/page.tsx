"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Input, Label, Button } from "@uxin/ui";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthForm, SubmitButton, GoogleAuthButton } from "@uxin/auth";
import { AuthLayout } from "@uxin/ui";
import { toast } from "@/components/toast";
import { type LoginActionState, login } from "../actions";

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  // const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction, isPending] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "failed") {
      toast({
        type: "error",
        description: "Invalid credentials!",
      });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Failed validating your submission!",
      });
    } else if (state.status === "success") {
      setIsRedirecting(true);
      router.push('/');
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  const renderForm = (isMobile: boolean) => (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#222325] font-medium">
          {t('auth.email')}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          defaultValue={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 border-[#e4e5e7] focus:border-[#1dbf73] focus:ring-[#1dbf73]"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-[#222325] font-medium">
            {t('auth.password')}
          </Label>
          <Link href="/forgot-password" className="text-sm text-[#1dbf73] font-medium hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('auth.enterPassword')}
            className="h-10 border-[#e4e5e7] focus:border-[#1dbf73] focus:ring-[#1dbf73] pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold h-10 text-[16px] mt-2 flex items-center justify-center gap-2"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('common.loading')}</span>
          </>
        ) : (
          t('navigation.login')
        )}
      </Button>
      
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground text-zinc-500">{t('auth.or')}</span>
        </div>
      </div>
      
      <GoogleAuthButton onClick={() => signIn("google", { callbackUrl: "/" })} text={t('auth.signInWithGoogle')} />

      <p className="mt-4 text-center text-gray-600 text-sm dark:text-zinc-400">
        {t('auth.noAccount')}{" "}
        <Link
          className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          href="/register"
        >
          {t('navigation.register')}
        </Link>
      </p>
    </form>
  );

  return (
    <>
      <AuthLayout
        renderForm={renderForm}
        title={t('navigation.login')}
        subtitle={t('auth.slogan')}
        appName={t('auth.appName')}
        promoTitle={t('auth.welcome')}
        promoFeatures={[
          t('auth.features.aiAssistant'),
          t('auth.features.seamlessChat'),
          t('auth.features.security')
        ]}
      />
      
      {(isPending || isRedirecting) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="p-4 rounded-xl bg-white/80 shadow-lg border border-gray-100 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[#1dbf73]" />
          </div>
        </div>
      )}
    </>
  );
}
