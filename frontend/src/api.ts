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

export type PredictionResponse = {
  probability: number;
  threshold: number;
  prediction: 0 | 1;
  risk_label: string;
  context: string;
  model_name: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function requestPrediction(payload: PredictionPayload): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("El servidor recibió demasiadas solicitudes. Intenta nuevamente en un minuto.");
    }
    throw new Error("No se pudo obtener la predicción. Revisa los datos o el servidor.");
  }

  return response.json();
}
