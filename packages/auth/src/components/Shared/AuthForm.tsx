"use client";

import { Input } from "@uxin/artifact-ui";
import React from "react";

const Label = ({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
  >
    {children}
  </label>
);

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  className,
}: {
  action: string | ((formData: FormData) => void | Promise<void>);
  children: React.ReactNode;
  defaultEmail?: string;
  className?: string;
}) {
  return (
    <form action={action as any} className={`flex flex-col gap-4 px-4 sm:px-16 ${className || ""}`}>
      <div className="flex flex-col gap-2">
        <Label className="font-normal text-zinc-600 dark:text-zinc-400" htmlFor="email">
          Email Address
        </Label>

        <Input
          autoComplete="email"
          autoFocus
          className="bg-muted text-md md:text-sm"
          defaultValue={defaultEmail}
          id="email"
          name="email"
          placeholder="user@acme.com"
          required
          type="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-normal text-zinc-600 dark:text-zinc-400" htmlFor="password">
          Password
        </Label>

        <Input
          className="bg-muted text-md md:text-sm"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      {children}
    </form>
  );
}
