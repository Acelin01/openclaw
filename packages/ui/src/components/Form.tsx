import React, { FormEvent } from "react";
import { cn } from "../lib/utils";

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  id?: string;
  autoComplete?: string;
  noValidate?: boolean;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className = "",
  id,
  autoComplete = "off",
  noValidate = true,
}) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
      autoComplete={autoComplete}
      noValidate={noValidate}
    >
      {children}
    </form>
  );
};

export default Form;
