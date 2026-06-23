import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { requestPrediction } from "../api";
import type { PredictionResponse } from "../api";
import { PredictionForm } from "./PredictionForm";
import { PredictionHeader } from "./PredictionHeader";
import { PredictionIntro } from "./PredictionIntro";
import { PredictionResultPanel } from "./PredictionResultPanel";
import {
  initialForm,
  toPredictionPayload,
  validateForm,
} from "./predictionFormConfig";
import type { FormState } from "./predictionFormConfig";

export function PredictionTool() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const probabilityPercent = useMemo(() => {
    if (!result) {
      return null;
    }
    return `${Math.round(result.probability * 100)}%`;
  }, [result]);

  function updateFormField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyFormState(nextForm: FormState) {
    setForm(nextForm);
    setError(null);
    setResult(null);
  }

  function resetForm() {
    applyFormState(initialForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await requestPrediction(toPredictionPayload(form));
      setResult(prediction);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="prediction-page">
      <PredictionHeader />

      <section
        className="prediction-section"
        id="evaluar-senales"
        aria-labelledby="prediction-title"
      >
        <PredictionIntro />

        <div className="workspace" aria-label="Formulario de predicción">
          <PredictionForm
            form={form}
            loading={loading}
            onApplyPreset={applyFormState}
            onFormChange={updateFormField}
            onReset={resetForm}
            onSubmit={handleSubmit}
          />
          <PredictionResultPanel
            error={error}
            loading={loading}
            probabilityPercent={probabilityPercent}
            result={result}
          />
        </div>
      </section>
    </div>
  );
}
