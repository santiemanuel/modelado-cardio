import type { FocusEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

export type ContextDropdownOption<T extends string> = {
  value: T;
  label: string;
};

type ContextDropdownProps<T extends string> = {
  id: string;
  label: string;
  value: T | "";
  options: Array<ContextDropdownOption<T>>;
  disabled?: boolean;
  isOpen: boolean;
  name?: string;
  className?: string;
  placeholder?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
  onChange: (value: T) => void;
  onOpenChange: (isOpen: boolean) => void;
};

export function ContextDropdown<T extends string>({
  id,
  label,
  value,
  options,
  disabled = false,
  isOpen,
  name,
  className = "",
  placeholder = "Seleccionar",
  invalid = false,
  ariaDescribedBy,
  onChange,
  onOpenChange,
}: ContextDropdownProps<T>) {
  const selectedOption = options.find((option) => option.value === value);
  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;

  function closeAfterBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onOpenChange(false);
    }
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onOpenChange(true);
    }

    if (event.key === "Escape") {
      onOpenChange(false);
    }
  }

  function handleOptionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      onOpenChange(false);
    }
  }

  return (
    <div
      className={`context-dropdown ${isOpen ? "context-dropdown-open" : ""} ${className}`.trim()}
      onBlurCapture={closeAfterBlur}
    >
      <span className="context-dropdown-label" id={labelId}>
        {label}
      </span>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        className={`context-dropdown-trigger ${
          selectedOption ? "" : "context-dropdown-trigger-placeholder"
        } ${invalid ? "context-dropdown-trigger-invalid" : ""}`.trim()}
        id={id}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={invalid ? true : undefined}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onOpenChange(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span className="context-dropdown-chevron" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="context-dropdown-menu" id={listboxId} role="listbox" aria-labelledby={labelId}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                className={`context-dropdown-option ${isSelected ? "context-dropdown-option-selected" : ""}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
                onKeyDown={handleOptionKeyDown}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
