import React from "react";
import { cn } from "../lib/utils";

export interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select";
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched = false,
  disabled = false,
  required = false,
  options = [],
  rows = 4,
  className = "",
  labelClassName = "",
  inputClassName = "",
  errorClassName = "",
}) => {
  const showError = touched && error;
  const baseInputClasses = cn(
    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
    showError ? "border-red-500" : "border-gray-300",
    disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white",
    inputClassName,
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={cn("mb-4", className)}>
      <label
        htmlFor={name}
        className={cn("block text-sm font-medium text-gray-700 mb-1", labelClassName)}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={baseInputClasses}
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={baseInputClasses}
        >
          <option value="">{placeholder || "请选择..."}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value || ""}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseInputClasses}
        />
      )}

      {showError && <p className={cn("mt-1 text-sm text-red-600", errorClassName)}>{error}</p>}
    </div>
  );
};

export default FormField;
