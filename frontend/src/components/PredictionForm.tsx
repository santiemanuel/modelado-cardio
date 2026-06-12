import type { FocusEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

import type { PredictionPayload } from "../api";
import {
  calculateBmi,
  fieldGroups,
  formatBmi,
  labDirectoryCenters,
  numericFields,
  raceOptions,
  testProfiles,
  validateNumericFields,
} from "./predictionFormConfig";
import type { FormState, NumericFieldKey } from "./predictionFormConfig";

type PredictionFormProps = {
  form: FormState;
  loading: boolean;
  onApplyPreset: (form: FormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onReset: () => void;
};

const formSteps = [
  {
    id: "presets",
    title: "Pruebas",
    shortLabel: "Casos base",
    heading: "Elegí un punto de partida",
    description: "Usá un caso completo para probar el modelo o avanzá para cargar valores propios.",
  },
  {
    id: "body",
    title: "Mediciones",
    shortLabel: "Peso, altura y cintura",
    heading: "Mediciones corporales",
    description: "Ingresá peso y altura; el IMC se calcula automáticamente para el modelo.",
  },
  {
    id: "lab",
    title: "Laboratorio",
    shortLabel: "Colesterol, HDL y A1c",
    heading: "Marcadores de laboratorio",
    description: "Completá las señales metabólicas indirectas antes de revisar el contexto.",
  },
  {
    id: "context",
    title: "Contexto",
    shortLabel: "Revisión y envío",
    heading: "Contexto declarado",
    description: "Confirmá las categorías usadas por el dataset y enviá la evaluación orientativa.",
  },
] as const;

const sexOptions: Array<{
  value: PredictionPayload["sex"];
  label: string;
}> = [
  { value: "Female", label: "Femenino" },
  { value: "Male", label: "Masculino" },
];

type ContextDropdownOption<T extends string> = {
  value: T;
  label: string;
};

type ContextDropdownProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: Array<ContextDropdownOption<T>>;
  disabled: boolean;
  isOpen: boolean;
  onChange: (value: T) => void;
  onOpenChange: (isOpen: boolean) => void;
};

function ContextDropdown<T extends string>({
  id,
  label,
  value,
  options,
  disabled,
  isOpen,
  onChange,
  onOpenChange,
}: ContextDropdownProps<T>) {
  const selectedOption = options.find((option) => option.value === value) ?? options[0];
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
      className={`context-dropdown ${isOpen ? "context-dropdown-open" : ""}`}
      onBlurCapture={closeAfterBlur}
    >
      <span className="context-dropdown-label" id={labelId}>
        {label}
      </span>
      <button
        className="context-dropdown-trigger"
        id={id}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onOpenChange(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedOption.label}</span>
        <span className="context-dropdown-chevron" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="context-dropdown-menu" id={listboxId} role="listbox" aria-labelledby={labelId}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                className={`context-dropdown-option ${
                  isSelected ? "context-dropdown-option-selected" : ""
                }`}
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

export function PredictionForm({
  form,
  loading,
  onApplyPreset,
  onSubmit,
  onFormChange,
  onReset,
}: PredictionFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [openContextDropdown, setOpenContextDropdown] = useState<"sex" | "race" | null>(null);
  const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
  const numericFieldByKey = new Map(numericFields.map((field) => [field.key, field]));
  const bodyGroup = fieldGroups[0];
  const labGroup = fieldGroups[1];
  const bodyComplete = areFieldsComplete(bodyGroup.fields);
  const labComplete = areFieldsComplete(labGroup.fields);
  const [debouncedBmi, setDebouncedBmi] = useState<number | null>(() => calculateBmi(form));
  const previousBmiInputsRef = useRef({ weight: form.BMXWT, height: form.BMXHT });
  const currentStep = formSteps[activeStep];

  useEffect(() => {
    const previousBmiInputs = previousBmiInputsRef.current;
    const weightChanged = previousBmiInputs.weight !== form.BMXWT;
    const heightChanged = previousBmiInputs.height !== form.BMXHT;
    previousBmiInputsRef.current = { weight: form.BMXWT, height: form.BMXHT };

    const nextBmi = calculateBmi({ BMXWT: form.BMXWT, BMXHT: form.BMXHT });
    if (nextBmi === null) {
      setDebouncedBmi(null);
      return undefined;
    }

    if (weightChanged && heightChanged) {
      setDebouncedBmi(nextBmi);
      return undefined;
    }

    setDebouncedBmi(null);
    const timeoutId = window.setTimeout(() => {
      setDebouncedBmi(nextBmi);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [form.BMXHT, form.BMXWT]);

  useEffect(() => {
    setOpenContextDropdown(null);
  }, [activeStep, loading]);

  useEffect(() => {
    if (!isDirectoryOpen) {
      return undefined;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDirectoryOpen(false);
      }
    }

    modalCloseButtonRef.current?.focus();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isDirectoryOpen]);

  function areFieldsComplete(fields: NumericFieldKey[]) {
    return validateNumericFields(form, fields) === null;
  }

  function getFieldError(fields: NumericFieldKey[]) {
    return validateNumericFields(form, fields);
  }

  function canOpenStep(stepIndex: number) {
    if (stepIndex <= 1) {
      return true;
    }
    if (stepIndex === 2) {
      return bodyComplete;
    }
    return bodyComplete && labComplete;
  }

  function goToStep(stepIndex: number) {
    if (loading || !canOpenStep(stepIndex)) {
      return;
    }
    setStepError(null);
    setActiveStep(stepIndex);
  }

  function goToNextStep() {
    if (activeStep === 1) {
      const error = getFieldError(bodyGroup.fields);
      if (error) {
        setStepError(error);
        return;
      }
    }

    if (activeStep === 2) {
      const error = getFieldError(labGroup.fields);
      if (error) {
        setStepError(error);
        return;
      }
    }

    setStepError(null);
    setActiveStep((current) => Math.min(current + 1, formSteps.length - 1));
  }

  function goToPreviousStep() {
    setStepError(null);
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  function applyPreset(values: FormState) {
    onApplyPreset(values);
    setStepError(null);
    setActiveStep(1);
  }

  function resetPagedForm() {
    onReset();
    setStepError(null);
    setActiveStep(0);
  }

  function renderNumericGroup(group: (typeof fieldGroups)[number]) {
    return (
      <fieldset className="form-group" key={group.title}>
        <legend>
          <strong>{group.title}</strong>
          <span>{group.description}</span>
        </legend>
        {group.fields.includes("LBXTC") ? (
          <div className="lab-directory-callout">
            <div>
              <strong>¿No conocés estos datos?</strong>
              <span>Consultá centros de Salta Capital donde suelen realizar análisis de rutina.</span>
            </div>
            <button
              className="directory-button"
              type="button"
              onClick={() => setIsDirectoryOpen(true)}
            >
              Directorio
            </button>
          </div>
        ) : null}
        <div className="field-grid">
          {group.fields.map((fieldKey) => {
            const field = numericFieldByKey.get(fieldKey);
            if (!field) {
              return null;
            }
            const inputId = `field-${field.key}`;
            return (
              <div className="field" key={field.key}>
                <label htmlFor={inputId}>{field.label}</label>
                <input
                  id={inputId}
                  type="number"
                  inputMode="decimal"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={form[field.key]}
                  aria-describedby={`${inputId}-hint`}
                  disabled={loading}
                  onChange={(event) => {
                    setStepError(null);
                    onFormChange(field.key, event.target.value);
                  }}
                />
                <small id={`${inputId}-hint`}>{field.hint}</small>
              </div>
            );
          })}
        </div>
        {group.fields.includes("BMXWT") && group.fields.includes("BMXHT") ? (
          <div className="bmi-calculation" aria-live="polite">
            <span>IMC calculado</span>
            <strong>
              {debouncedBmi === null
                ? formatBmi(debouncedBmi)
                : `${formatBmi(debouncedBmi)} kg/m²`}
            </strong>
            <small>Se actualiza automáticamente con peso y altura.</small>
          </div>
        ) : null}
      </fieldset>
    );
  }

  return (
    <>
    <form className="prediction-form" onSubmit={onSubmit} noValidate>
      <div className="form-watermark" aria-hidden="true">
        <svg className="watermark-icon watermark-icon-heart" viewBox="0 0 64 64">
          <path d="M8 34h10l5-12 9 26 7-18h17" />
          <path d="M20 18c4-8 17-8 20 2 5-8 17-5 18 6 2 15-18 25-26 30C23 50 6 42 6 28c0-5 4-10 14-10Z" />
        </svg>
        <svg className="watermark-icon watermark-icon-drop" viewBox="0 0 64 64">
          <path d="M32 6c10 13 18 23 18 35 0 11-8 18-18 18s-18-7-18-18C14 29 22 19 32 6Z" />
          <path d="M25 44c2 4 6 6 12 5" />
        </svg>
        <svg className="watermark-icon watermark-icon-gauge" viewBox="0 0 64 64">
          <path d="M12 46a22 22 0 1 1 40 0" />
          <path d="M32 42l12-16" />
          <path d="M22 46h20" />
        </svg>
      </div>

      <div className="form-console">
        <div>
          <span>Paso {activeStep + 1} de {formSteps.length}</span>
          <strong>{currentStep.heading}</strong>
        </div>
        <p>{currentStep.description}</p>
      </div>

      <ol className="form-stepper" aria-label="Progreso del formulario">
        {formSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isLocked = !canOpenStep(index);
          return (
            <li key={step.id}>
              <button
                className="step-button"
                type="button"
                aria-label={`Paso ${index + 1}: ${step.title}. ${step.shortLabel}`}
                aria-current={isActive ? "step" : undefined}
                disabled={loading || isLocked}
                onClick={() => goToStep(index)}
              >
                <span className="step-index">{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <em>{step.shortLabel}</em>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="form-step-panel">
        {activeStep === 0 ? (
          <div className="preset-grid" aria-label="Casos de prueba">
            {testProfiles.map((profile) => (
              <button
                className="preset-button"
                type="button"
                disabled={loading}
                key={profile.id}
                onClick={() => applyPreset(profile.values)}
              >
                <strong>{profile.label}</strong>
                <span>{profile.description}</span>
              </button>
            ))}
          </div>
        ) : null}

        {activeStep === 1 ? renderNumericGroup(bodyGroup) : null}
        {activeStep === 2 ? renderNumericGroup(labGroup) : null}

        {activeStep === 3 ? (
          <fieldset className="form-group context-group">
            <legend>
              <strong>Contexto declarado</strong>
              <span>Categorías compatibles con el dataset usado por el modelo.</span>
            </legend>
            <div className="field-grid categorical-grid">
              <div className="field">
                <ContextDropdown
                  id="field-sex"
                  label="Sexo"
                  value={form.sex}
                  disabled={loading}
                  options={sexOptions}
                  isOpen={openContextDropdown === "sex"}
                  onChange={(value) => onFormChange("sex", value)}
                  onOpenChange={(isOpen) => setOpenContextDropdown(isOpen ? "sex" : null)}
                />
              </div>

              <div className="field">
                <ContextDropdown
                  id="field-race"
                  label="Grupo étnico reportado"
                  value={form.race_ethnicity}
                  disabled={loading}
                  options={raceOptions}
                  isOpen={openContextDropdown === "race"}
                  onChange={(value) => onFormChange("race_ethnicity", value)}
                  onOpenChange={(isOpen) => setOpenContextDropdown(isOpen ? "race" : null)}
                />
              </div>

              <div
                className={`field smoker-toggle-field ${
                  form.current_smoker === "1.0" ? "smoker-toggle-field-on" : ""
                }`}
              >
                <label id="field-smoker-label" htmlFor="field-smoker">
                  Fumador actual
                </label>
                <div className="android-toggle-row">
                  <span className="android-toggle-state" id="field-smoker-status">
                    {form.current_smoker === "1.0" ? "Sí" : "No"}
                  </span>
                  <span className="android-toggle-shell">
                    <input
                      id="field-smoker"
                      className="android-toggle-input"
                      type="checkbox"
                      role="switch"
                      aria-labelledby="field-smoker-label"
                      aria-describedby="field-smoker-status"
                      checked={form.current_smoker === "1.0"}
                      disabled={loading}
                      onChange={(event) =>
                        onFormChange("current_smoker", event.target.checked ? "1.0" : "0.0")
                      }
                    />
                    <span className="android-toggle-track" aria-hidden="true">
                      <span className="android-toggle-thumb" />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </fieldset>
        ) : null}
      </div>

      {stepError ? (
        <p className="step-message" role="alert">
          {stepError}
        </p>
      ) : null}

      <div className="form-actions">
        <button className="form-reset" type="button" disabled={loading} onClick={resetPagedForm}>
          Limpiar datos
        </button>

        <div className="step-action-group">
          {activeStep > 0 ? (
            <button className="step-back" type="button" disabled={loading} onClick={goToPreviousStep}>
              Anterior
            </button>
          ) : null}

          {activeStep < formSteps.length - 1 ? (
            <button className="step-next" type="button" disabled={loading} onClick={goToNextStep}>
              Continuar
            </button>
          ) : (
            <button
              className="submit-button"
              type="button"
              disabled={loading}
              onClick={(event) => event.currentTarget.form?.requestSubmit()}
            >
              {loading ? "Calculando..." : "Evaluar señales"}
            </button>
          )}
        </div>
      </div>
    </form>

      {isDirectoryOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsDirectoryOpen(false);
            }
          }}
        >
          <section
            className="lab-directory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lab-directory-title"
            aria-describedby="lab-directory-description"
          >
            <div className="modal-heading">
              <div>
                <span>Directorio local</span>
                <h2 id="lab-directory-title">Centros para análisis de rutina en Salta Capital</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                ref={modalCloseButtonRef}
                aria-label="Cerrar directorio"
                onClick={() => setIsDirectoryOpen(false)}
              >
                ×
              </button>
            </div>
            <p id="lab-directory-description">
              Antes de concurrir, confirmá si realizan colesterol total, HDL y hemoglobina
              glicosilada, y si necesitás pedido médico, turno u obra social.
            </p>
            <div className="directory-list">
              {labDirectoryCenters.map((center) => (
                <article className="directory-item" key={center.name}>
                  <div>
                    <span>{center.kind}</span>
                    <h3>{center.name}</h3>
                    <p>{center.address}</p>
                  </div>
                  <p>{center.evidence}</p>
                  <a href={center.sourceUrl} target="_blank" rel="noreferrer">
                    Fuente: {center.sourceLabel}
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
