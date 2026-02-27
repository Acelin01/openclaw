"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { Input, Label, Button } from "@uxin/ui";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthForm, SubmitButton, GoogleAuthButton } from "@uxin/auth";
import { AuthLayout } from "@uxin/ui";
import { toast } from "@/components/toast";
import { type RegisterActionState, register } from "../actions";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation(["auth", "common"]);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [state, formAction, isPending] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: t('error.account_exists') });
    } else if (state.status === "failed") {
      toast({ type: "error", description: state.message || t('error.create_failed') });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: t('error.validation_failed'),
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: t('success.account_created') });

      setIsSuccessful(true);
      setIsRedirecting(true);
      // updateSession();
      // router.refresh();
      router.push('/login');
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
          {t('email')}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t('email_placeholder')}
          defaultValue={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 border-[#e4e5e7] focus:border-[#1dbf73] focus:ring-[#1dbf73]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#222325] font-medium">
          {t('password')}
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('create_password_placeholder')}
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
        disabled={isPending || isSuccessful}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('registering')}</span>
          </>
        ) : isSuccessful ? (
          t('register_success')
        ) : (
          t('register')
        )}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground text-zinc-500">{t('or')}</span>
        </div>
      </div>
      
      <GoogleAuthButton onClick={() => signIn("google", { callbackUrl: "/" })} text={t('register_with_google')} />

      <p className="mt-4 text-center text-gray-600 text-sm dark:text-zinc-400">
        {t('already_have_account') + " "}
        <Link
          className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          href="/login"
        >
          {t('login')}
        </Link>
      </p>
    </form>
  );

  return (
    <>
      <AuthLayout
        renderForm={renderForm}
        title={t('register_title')}
        subtitle={t('register_subtitle')}
        appName={t('common:app_name')}
        promoTitle={t('promo_title')}
        promoFeatures={[
          t('promo_feature_1'),
          t('promo_feature_2'),
          t('promo_feature_3')
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
