export type PredictionPayload = {
  RIDAGEYR: number;
  BMXBMI: number;
  BMXWAIST: number;
  LBXTC: number;
  LBDHDD: number;
  LBXGH: number;
  sex: "Female" | "Male";
  race_ethnicity:
    | "Mexican American"
    | "Non-Hispanic Asian"
    | "Non-Hispanic Black"
    | "Non-Hispanic White"
    | "Other Hispanic"
    | "Other Race / Multi-Racial";
  current_smoker: 0.0 | 1.0;
};

export type SimplePredictionPayload = Omit<PredictionPayload, "LBXTC" | "LBDHDD" | "LBXGH">;

export type PredictionResponse = {
  probability: number;
  threshold: number;
  prediction: 0 | 1;
  risk_label: string;
  context: string;
  model_name: string;
  model_version?: string;
  mode?: "complete" | "simple";
  shap_explanations?: ShapExplanation[];
  shap_base_value?: number | null;
  shap_output_unit?: "log_odds" | string;
};

export type ShapExplanation = {
  feature: string;
  label: string;
  value: string;
  shap_value: number;
  impact: number;
  direction: "raises_risk" | "lowers_risk" | "neutral";
  description: string;
};

export type ModelInfoResponse = {
  model_name: string;
  model_version: string;
  metadata_version: string;
  trained_at: string;
  target: string;
  threshold_default: number;
  threshold_policy: Record<string, string>;
  features: string[];
  numeric_features: string[];
  categorical_features: string[];
  primary_test_metrics_weighted: Array<Record<string, number | string>>;
  available_modes: string[];
  model_summaries: Array<{
    mode: "complete" | "simple";
    model_name: string;
    model_version: string;
    threshold_default: number;
    primary_test_metrics_weighted: Array<Record<string, number | string>>;
  }>;
};

export type ThresholdsResponse = {
  model_name: string;
  model_version: string;
  threshold_policy: Record<string, string>;
  thresholds: Array<{
    name: string;
    label: string;
    threshold: number;
    description: string;
  }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function errorForStatus(status: number) {
  if (status === 429) {
    return "El servidor recibió demasiadas solicitudes. Intentá nuevamente en un minuto.";
  }
  if (status === 422) {
    return "Hay datos que el servidor no pudo validar. Revisá los campos marcados.";
  }
  if (status >= 500) {
    return "No se pudo obtener la predicción porque el servicio de evaluación no respondió bien. Intentá más tarde.";
  }
  return "No se pudo obtener la predicción. Revisá los datos e intentá nuevamente.";
}

async function postPrediction(
  path: "/predict" | "/predict-simple",
  payload: PredictionPayload | SimplePredictionPayload,
): Promise<PredictionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("No se pudo conectar con el servicio de evaluación. Intentá nuevamente en unos minutos.");
  }

  if (!response.ok) {
    throw new Error(errorForStatus(response.status));
  }

  return response.json();
}

export function requestPrediction(payload: PredictionPayload): Promise<PredictionResponse> {
  return postPrediction("/predict", payload);
}

export function requestSimplePrediction(
  payload: SimplePredictionPayload,
): Promise<PredictionResponse> {
  return postPrediction("/predict-simple", payload);
}

export async function requestModelInfo(): Promise<ModelInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/model-info`);
  if (!response.ok) {
    throw new Error("No se pudo cargar la información del modelo.");
  }
  return response.json();
}

export async function requestThresholds(): Promise<ThresholdsResponse> {
  const response = await fetch(`${API_BASE_URL}/thresholds`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar los umbrales del modelo.");
  }
  return response.json();
}
