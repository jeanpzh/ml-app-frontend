import { NEXT_PUBLIC_API_BASE_URL } from "@/lib/config";
import type {
  RetrainParams,
  PredictParams,
  RetrainResponse,
  PredictResponse,
} from "@/types/clustering";

// Servicio para interactuar con la API
export const ApiService = {
  retrainModel: async (params: RetrainParams): Promise<RetrainResponse> => {
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/retrain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ n_clusters: params.n_clusters }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  },

  // Predecir el cluster de un cliente
  predictCustomer: async (params: PredictParams): Promise<PredictResponse> => {
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        annual_income: params.annual_income,
        spending_score: params.spending_score,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  },
};
