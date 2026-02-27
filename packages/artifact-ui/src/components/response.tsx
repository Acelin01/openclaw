"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "../lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
        "[&_h1]:text-sm [&_h1]:font-bold [&_h1]:m-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:m-0 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:m-0 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:m-0 [&_h5]:text-sm [&_h5]:font-bold [&_h5]:m-0 [&_h6]:text-sm [&_h6]:font-bold [&_h6]:m-0",
        className,
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
