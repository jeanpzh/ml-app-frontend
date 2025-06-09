export interface RetrainParams {
  n_clusters: number
}

// Parámetros para predecir un cliente
export interface PredictParams {
  annual_income: number
  spending_score: number
}

// Respuesta de reentrenamiento
export interface RetrainResponse {
  message: string
  silhouette_score?: number
}

// Respuesta de predicción
export interface PredictResponse {
  cluster: number
}

// Entrada en el historial de reentrenamiento
export interface HistoryEntry {
  id: string
  params: {
    n_clusters: number
    timestamp: number
  }
  result: RetrainResponse
  timestamp: number
}

// Predicción de cliente
export interface CustomerPrediction {
  id: string
  annual_income: number
  spending_score: number
  cluster: number
  timestamp: number
}
