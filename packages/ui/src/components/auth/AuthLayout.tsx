import { CheckCircle, ArrowLeft } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";

export interface AuthLayoutProps {
  renderForm: (isMobile: boolean) => React.ReactNode;
  title: string;
  subtitle?: string;
  promoTitle?: string;
  promoFeatures?: string[];
  backLink?: { href: string; label: string };
  appName?: string;
  className?: string;
}

export function AuthLayout({
  renderForm,
  title,
  subtitle,
  promoTitle = "Success starts here",
  promoFeatures = ["Over 700 categories", "Quality work done faster", "Access to global talent"],
  backLink,
  appName = "UxIn",
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-[#f7f7f7] p-4 md:p-5 font-sans",
        className,
      )}
    >
      {/* Mobile Layout Container */}
      <div className="md:hidden w-full max-w-[420px] bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Mobile Header */}
        <div className="bg-[#1dbf73] text-white p-6 text-center">
          <div className="text-[28px] font-bold mb-2 flex items-center justify-center">
            <div className="bg-white text-[#1dbf73] w-8 h-8 rounded-md flex items-center justify-center mr-2.5 font-bold">
              UX
            </div>
            {appName}
          </div>
          <div className="text-sm opacity-90 mb-2 font-medium">{promoTitle}</div>
        </div>

        {/* Mobile Content */}
        <div className="p-[30px]">
          <h2 className="text-lg text-[#222325] mb-6 text-center font-bold">{title}</h2>

          {renderForm(true)}

          <div className="text-xs text-[#62646a] text-center pt-5 border-t border-[#f1f1f1] leading-relaxed">
            By joining, you agree to the {appName}{" "}
            <a href="#" className="text-[#1dbf73] hover:underline">
              Terms of Service
            </a>{" "}
            and to occasionally receive emails from us. Please read our{" "}
            <a href="#" className="text-[#1dbf73] hover:underline">
              Privacy Policy
            </a>{" "}
            to learn how we use your personal data.
          </div>
        </div>
      </div>

      {/* PC Layout Container */}
      <div className="hidden md:flex w-full max-w-[1100px] h-[700px] bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden flex-row">
        {/* Left Section - Promo */}
        <div className="flex-1 bg-[#1dbf73] text-white p-[60px_40px] flex-col relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-2xl font-bold mb-10 flex items-center">
              <div className="bg-white text-[#1dbf73] w-9 h-9 rounded-lg flex items-center justify-center mr-3 font-bold">
                UX
              </div>
              {appName}
            </div>

            <h1 className="text-4xl font-bold leading-[1.2] mb-10 max-w-[400px]">{promoTitle}</h1>

            <ul className="list-none mb-[60px] space-y-6">
              {promoFeatures.map((feature, index) => (
                <li key={index} className="flex items-center text-lg">
                  <div className="bg-white/20 w-7 h-7 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto text-sm opacity-90">
              © 2024 {appName} International Ltd. All rights reserved.
            </div>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute bottom-0 right-0 opacity-10 text-white transform rotate-15 text-[300px] pointer-events-none">
            <div className="w-[300px] h-[300px] border-[40px] border-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex-1 p-[60px_50px] flex flex-col">
          {backLink && (
            <a
              href={backLink.href}
              className="flex items-center text-[#62646a] text-sm mb-[30px] hover:text-[#1dbf73] transition-colors w-fit"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              {backLink.label}
            </a>
          )}

          <h2 className="text-2xl text-[#222325] font-semibold mb-10">{title}</h2>

          <div className="flex-1">{renderForm(false)}</div>

          <div className="mt-auto pt-5 border-t border-[#f1f1f1] text-xs text-[#62646a] leading-relaxed">
            By joining, you agree to the {appName}{" "}
            <a href="#" className="text-[#1dbf73] hover:underline">
              Terms of Service
            </a>{" "}
            and to occasionally receive emails from us. Please read our{" "}
            <a href="#" className="text-[#1dbf73] hover:underline">
              Privacy Policy
            </a>{" "}
            to learn how we use your personal data.
          </div>
        </div>
      </div>
    </div>
  );
}
