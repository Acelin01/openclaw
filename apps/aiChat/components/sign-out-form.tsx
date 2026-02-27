import Form from "next/form";

import { signOut } from "@/app/(auth)/auth";
import { Button } from "@uxin/ui";

export const SignOutForm = () => {
  return (
    <Form
      action={async () => {
        "use server";

        await signOut({
          redirectTo: "/login",
        });
      }}
      className="w-full"
    >
      <Button
        variant="ghost"
        className="w-full px-1 py-0.5 text-left text-red-500 hover:text-red-600 hover:bg-red-50 justify-start h-auto font-normal"
        type="submit"
      >
        Sign out
      </Button>
    </Form>
  );
};
