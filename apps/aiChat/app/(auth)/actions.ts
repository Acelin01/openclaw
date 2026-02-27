"use server";

import { z } from "zod";

import { AuthService } from "@uxin/auth";

import { signIn, signOut } from "./auth";

export const logout = async () => {
  await signOut({ redirectTo: "/login" });
};


const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const normalizeAuthInput = (formData: FormData) => ({
  email: String(formData.get("email") ?? "").trim().toLowerCase(),
  password: String(formData.get("password") ?? "").trim(),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse(normalizeAuthInput(formData));

    // Verify credentials via AuthService first if needed, 
    // but NextAuth credentials provider usually handles this.
    // However, if we want to ensure the backend API is reachable and credentials are valid
    // BEFORE calling signIn (which might just call the authorize function), we can do it here.
    // In this existing code structure, signIn calls the authorize function in auth.ts.
    // We should update auth.ts to use AuthService as well.
    
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: true,
      redirectTo: "/",
    });

    return { status: "success" };
  } catch (error) {
    if ((error as any).digest?.startsWith('NEXT_REDIRECT') || (error as any).message === 'NEXT_REDIRECT') {
      throw error;
    }
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
      return { status: "success" };
    }

    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
  message?: string;
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse(normalizeAuthInput(formData));

    const result = await AuthService.register({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.email.split('@')[0],
      role: 'CUSTOMER'
    });

    console.log('Register result:', result);

    if (result.error === 'User exists') {
      return { status: "user_exists" } as RegisterActionState;
    }

    if (!result.success) {
      return { status: "failed", message: result.message || result.error || "Unknown error" };
    }

    // 用户注册成功后，不自动登录，直接返回成功状态，让前端跳转到登录页
    // try {
    //   await signIn("credentials", {
    //     email: validatedData.email,
    //     password: validatedData.password,
    //     redirect: false,
    //   });
    // } catch (signInError) {
    //   console.error("Auto-login after register failed:", signInError);
    //   if ((signInError as any).digest?.startsWith('NEXT_REDIRECT')) {
    //     return { status: "success" };
    //   }
    // }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};
