import type { FormEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { PredictionPayload } from "../api";
import { buttonLabels, measurementHelp } from "../content/evaluationContent";
import { ContextDropdown } from "./ContextDropdown";
import type { ContextDropdownOption } from "./ContextDropdown";
import {
  calculateBmi,
  fieldGroups,
  formatBmi,
  labDirectoryCenters,
  numericFields,
  raceOptions,
  validateContextFields,
  validateContextFieldMap,
  validateNumericFields,
  validateNumericFieldMap,
} from "./predictionFormConfig";
import type {
  ContextFieldKey,
  EvaluationMode,
  FormState,
  NumericFieldKey,
} from "./predictionFormConfig";
import { ResourceContactLinks } from "./ResourceContactLinks";

type PredictionFormProps = {
  form: FormState;
  loading: boolean;
  mode: EvaluationMode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToStart: () => void;
  onFormChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onReset: () => void;
};

const formSteps = [
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
    description: "Confirmá las categorías usadas por el modelo y enviá la evaluación orientativa.",
  },
] as const;

const sexOptions: Array<{
  value: PredictionPayload["sex"];
  label: string;
}> = [
  { value: "Female", label: "Femenino" },
  { value: "Male", label: "Masculino" },
];

export function PredictionForm({
  form,
  loading,
  mode,
  onSubmit,
  onBackToStart,
  onFormChange,
  onReset,
}: PredictionFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<NumericFieldKey, string>>>({});
  const [contextFieldErrors, setContextFieldErrors] = useState<
    Partial<Record<ContextFieldKey, string>>
  >({});
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [openContextDropdown, setOpenContextDropdown] = useState<"sex" | "race" | null>(null);
  const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
  const validationSummaryRef = useRef<HTMLDivElement>(null);
  const numericFieldByKey = new Map(numericFields.map((field) => [field.key, field]));
  const bodyGroup = fieldGroups[0];
  const labGroup = fieldGroups[1];
  const bodyComplete = areFieldsComplete(bodyGroup.fields);
  const labComplete = mode === "simple" || areFieldsComplete(labGroup.fields);
  const [debouncedBmi, setDebouncedBmi] = useState<number | null>(() => calculateBmi(form));
  const previousBmiInputsRef = useRef({ weight: form.BMXWT, height: form.BMXHT });
  const currentBmi = calculateBmi(form);
  const isBmiOutsideExpectedRange = currentBmi !== null && (currentBmi < 10 || currentBmi > 80);
  const validationItems = Array.from(
    new Set(
      [...Object.values(fieldErrors), ...Object.values(contextFieldErrors)].filter(
        (item): item is string => Boolean(item),
      ),
    ),
  );
  const currentStep = formSteps[activeStep];
  const currentStepDescription =
    mode === "simple" && activeStep === 1
      ? "Usá el modo simple cuando no tengas laboratorio reciente. El resultado usa menos datos."
      : currentStep.description;

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
    if (stepError) {
      validationSummaryRef.current?.focus();
    }
  }, [stepError]);

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
    if (stepIndex === 0) {
      return true;
    }
    if (stepIndex === 1) {
      return bodyComplete;
    }
    return bodyComplete && labComplete;
  }

  function goToStep(stepIndex: number) {
    if (loading || !canOpenStep(stepIndex)) {
      return;
    }
    setStepError(null);
    setFieldErrors({});
    setContextFieldErrors({});
    setActiveStep(stepIndex);
  }

  function goToNextStep() {
    if (activeStep === 0) {
      const errors = validateNumericFieldMap(form, bodyGroup.fields);
      const error = getFieldError(bodyGroup.fields);
      if (error) {
        setFieldErrors(errors);
        setStepError("Revisá los campos marcados antes de continuar.");
        return;
      }
    }

    if (activeStep === 1 && mode === "complete") {
      const errors = validateNumericFieldMap(form, labGroup.fields);
      const error = getFieldError(labGroup.fields);
      if (error) {
        setFieldErrors(errors);
        setStepError("Revisá los campos marcados antes de continuar.");
        return;
      }
    }

    setStepError(null);
    setFieldErrors({});
    setContextFieldErrors({});
    setActiveStep((current) => Math.min(current + 1, formSteps.length - 1));
  }

  function goToPreviousStep() {
    setStepError(null);
    setFieldErrors({});
    setContextFieldErrors({});
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  function resetPagedForm() {
    onReset();
    setStepError(null);
    setFieldErrors({});
    setContextFieldErrors({});
    setActiveStep(0);
  }

  function submitPagedForm(event: MouseEvent<HTMLButtonElement>) {
    const errors = validateContextFieldMap(form);
    const error = validateContextFields(form);
    if (error) {
      setContextFieldErrors(errors);
      setStepError("Seleccioná las categorías marcadas antes de enviar.");
      return;
    }

    setStepError(null);
    setContextFieldErrors({});
    event.currentTarget.form?.requestSubmit();
  }

  function renderNumericGroup(group: (typeof fieldGroups)[number]) {
    const isBodyGroup = group.fields.includes("BMXWT") && group.fields.includes("BMXHT");
    const bmiHelpText = isBmiOutsideExpectedRange
      ? "Revisá peso y altura: el IMC calculado queda fuera del rango esperado para esta evaluación."
      : measurementHelp.bmi;

    return (
      <fieldset className="form-group" key={group.title}>
        <legend>
          <strong>{group.title}</strong>
          {!isBodyGroup ? <span>{group.description}</span> : null}
        </legend>
        {group.fields.includes("LBXTC") ? (
          <div className="lab-directory-callout">
            <div>
              <strong>¿No conocés estos datos?</strong>
              <span>
                Buscá colesterol total, HDL y HbA1c; confirmá requisitos antes de concurrir.
              </span>
            </div>
            <button
              className="directory-button"
              type="button"
              onClick={() => setIsDirectoryOpen(true)}
            >
              {buttonLabels.viewDirectory}
            </button>
          </div>
        ) : null}
        <div className={`field-grid ${isBodyGroup ? "measurement-field-grid" : ""}`}>
          {group.fields.map((fieldKey) => {
            const field = numericFieldByKey.get(fieldKey);
            if (!field) {
              return null;
            }
            const inputId = `field-${field.key}`;
            const error = fieldErrors[field.key];
            return (
              <div className={`field ${error ? "field-invalid" : ""}`} key={field.key}>
                <label htmlFor={inputId}>{field.label}</label>
                <div className="unit-input">
                  <input
                    id={inputId}
                    type="text"
                    inputMode="decimal"
                    value={form[field.key]}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={`${inputId}-hint ${inputId}-unit`}
                    disabled={loading}
                    onChange={(event) => {
                      setStepError(null);
                      setFieldErrors((current) => ({ ...current, [field.key]: undefined }));
                      onFormChange(field.key, event.target.value);
                    }}
                  />
                  <span id={`${inputId}-unit`}>{field.unit}</span>
                </div>
                <small id={`${inputId}-hint`}>{field.hint}</small>
              </div>
            );
          })}
        </div>
        {isBodyGroup ? (
          <div className="measurement-help-grid">
            <div
              className={`bmi-calculation ${
                isBmiOutsideExpectedRange ? "bmi-calculation-invalid" : ""
              }`}
              aria-live="polite"
            >
              <span>IMC calculado</span>
              <strong>
                {debouncedBmi === null
                  ? formatBmi(debouncedBmi)
                  : `${formatBmi(debouncedBmi)} kg/m²`}
              </strong>
              <small>{bmiHelpText}</small>
            </div>
            <aside className="measurement-help-card" aria-label="Cómo medir cintura">
              <strong>Cómo medir cintura</strong>
              <p>{measurementHelp.waist}</p>
            </aside>
          </div>
        ) : null}
      </fieldset>
    );
  }

  const directoryModal = isDirectoryOpen
    ? createPortal(
        <div
          className="modal-backdrop lab-directory-backdrop"
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
                aria-label={buttonLabels.closeDirectory}
                onClick={() => setIsDirectoryOpen(false)}
              >
                ×
              </button>
            </div>
            <p id="lab-directory-description">
              {measurementHelp.lab}
            </p>
            <div className="directory-list">
              {labDirectoryCenters.map((center) => (
                <article className="directory-item" key={center.name}>
                  <div>
                    <span>{center.kind}</span>
                    <h3>{center.name}</h3>
                    <p>{center.address}</p>
                    <ResourceContactLinks contact={center.contact} />
                  </div>
                  <p>{center.evidence}</p>
                  <dl className="directory-details">
                    <div>
                      <dt>Servicios mencionados</dt>
                      <dd>{center.servicesMentioned.join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Preguntas para confirmar</dt>
                      <dd>{center.questionsToConfirm.join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Antes de ir</dt>
                      <dd>{center.scheduleNote}</dd>
                    </div>
                  </dl>
                  <a href={center.sourceUrl} target="_blank" rel="noreferrer">
                    Ver sitio de {center.sourceLabel}
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>,
        document.body,
      )
    : null;

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
        <p>{currentStepDescription}</p>
      </div>

      <ol className="form-stepper" aria-label="Progreso del formulario">
        {formSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isLocked = !canOpenStep(index);
          const stepTitle = mode === "simple" && step.id === "lab" ? "Sin laboratorio" : step.title;
          const stepLabel =
            mode === "simple" && step.id === "lab" ? "Modelo simple" : step.shortLabel;
          return (
            <li key={step.id}>
              <button
                className="step-button"
                type="button"
                aria-label={`Paso ${index + 1}: ${stepTitle}. ${stepLabel}`}
                aria-current={isActive ? "step" : undefined}
                disabled={loading || isLocked}
                onClick={() => goToStep(index)}
              >
                <span className="step-index">{index + 1}</span>
                <span>
                  <strong>{stepTitle}</strong>
                  <em>{stepLabel}</em>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {stepError ? (
        <div
          className="validation-summary"
          role="alert"
          tabIndex={-1}
          ref={validationSummaryRef}
        >
          <strong>{stepError}</strong>
          {validationItems.length > 0 ? (
            <ul>
              {validationItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="form-step-panel">
        {activeStep === 0 ? renderNumericGroup(bodyGroup) : null}
        {activeStep === 1 && mode === "complete" ? renderNumericGroup(labGroup) : null}
        {activeStep === 1 && mode === "simple" ? (
          <section className="simple-mode-panel" aria-labelledby="simple-mode-title">
            <p className="section-kicker">Modo simple</p>
            <h2 id="simple-mode-title">Evaluación sin laboratorio reciente</h2>
            <p>
              Este modo no solicita colesterol total, HDL ni HbA1c. Usa edad, IMC, cintura, sexo
              reportado, grupo étnico reportado y tabaquismo actual. El resultado puede ser menos
              preciso porque trabaja con menos información.
            </p>
          </section>
        ) : null}

        {activeStep === 2 ? (
          <fieldset className="form-group context-group">
            <legend>
              <strong>Contexto declarado</strong>
              <span>Categorías necesarias para usar el modelo actual.</span>
            </legend>
            <div className="field-grid categorical-grid">
              <div className="field">
                <ContextDropdown
                  id="field-sex"
                  label="Sexo reportado"
                  value={form.sex}
                  disabled={loading}
                  options={sexOptions}
                  placeholder="Seleccionar"
                  invalid={Boolean(contextFieldErrors.sex)}
                  ariaDescribedBy={`field-sex-hint${
                    contextFieldErrors.sex ? " field-sex-error" : ""
                  }`}
                  isOpen={openContextDropdown === "sex"}
                  onChange={(value) => {
                    setContextFieldErrors((current) => ({ ...current, sex: undefined }));
                    setStepError(null);
                    onFormChange("sex", value);
                  }}
                  onOpenChange={(isOpen) => setOpenContextDropdown(isOpen ? "sex" : null)}
                />
                <small id="field-sex-hint">
                  Esta categoría replica la variable disponible en la encuesta original. No describe
                  identidad de género de forma amplia.
                </small>
                {contextFieldErrors.sex ? (
                  <small className="field-error" id="field-sex-error">
                    {contextFieldErrors.sex}
                  </small>
                ) : null}
              </div>

              <div className="field">
                <ContextDropdown
                  id="field-race"
                  label="Grupo étnico reportado"
                  value={form.race_ethnicity}
                  disabled={loading}
                  options={raceOptions}
                  placeholder="Seleccionar"
                  invalid={Boolean(contextFieldErrors.race_ethnicity)}
                  ariaDescribedBy={`field-race-hint${
                    contextFieldErrors.race_ethnicity ? " field-race-error" : ""
                  }`}
                  isOpen={openContextDropdown === "race"}
                  onChange={(value) => {
                    setContextFieldErrors((current) => ({
                      ...current,
                      race_ethnicity: undefined,
                    }));
                    setStepError(null);
                    onFormChange("race_ethnicity", value);
                  }}
                  onOpenChange={(isOpen) => setOpenContextDropdown(isOpen ? "race" : null)}
                />
                <small id="field-race-hint">
                  Esta categoría proviene de NHANES 2017-2018, una encuesta de Estados Unidos. Puede
                  no representar perfectamente identidades locales; elegí la opción más cercana solo
                  porque el modelo actual la requiere como variable técnica.
                </small>
                {contextFieldErrors.race_ethnicity ? (
                  <small className="field-error" id="field-race-error">
                    {contextFieldErrors.race_ethnicity}
                  </small>
                ) : null}
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
                <small>
                  En NHANES, el tabaquismo actual se deriva de preguntas sobre consumo de cigarrillos
                  y consumo actual.
                </small>
              </div>
            </div>
          </fieldset>
        ) : null}
      </div>

      <div className="form-actions">
        <div className="form-secondary-actions">
          <button className="form-reset" type="button" disabled={loading} onClick={resetPagedForm}>
            {buttonLabels.clearData}
          </button>
          <button className="step-back" type="button" disabled={loading} onClick={onBackToStart}>
            Cambiar modo
          </button>
        </div>

        <div className="step-action-group">
          {activeStep > 0 ? (
            <button className="step-back" type="button" disabled={loading} onClick={goToPreviousStep}>
              {buttonLabels.previous}
            </button>
          ) : null}

          {activeStep < formSteps.length - 1 ? (
            <button className="step-next" type="button" disabled={loading} onClick={goToNextStep}>
              {buttonLabels.continue}
            </button>
          ) : (
            <button
              className="submit-button"
              type="button"
              disabled={loading}
              onClick={submitPagedForm}
            >
              {loading ? buttonLabels.calculating : buttonLabels.evaluateSignals}
            </button>
          )}
        </div>
      </div>
    </form>

      {directoryModal}
    </>
  );
}
