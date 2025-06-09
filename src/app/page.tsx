"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Loader2, User, Settings } from "lucide-react";
import { ApiService } from "@/services/api-service";
import type {
  RetrainResponse,
  PredictResponse,
  HistoryEntry,
  CustomerPrediction,
} from "@/types/clustering";
import Navigation from "@/components/navigation";

export default function HomePage() {
  // Estado para reentrenar el modelo
  const [nClusters, setNClusters] = useState<number>(3);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainError, setRetrainError] = useState<string>("");
  const [retrainResult, setRetrainResult] = useState<RetrainResponse | null>(
    null
  );

  // Estado para predecir cliente
  const [annualIncome, setAnnualIncome] = useState<number>(50);
  const [spendingScore, setSpendingScore] = useState<number>(60);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string>("");
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(
    null
  );

  const validateClusters = (value: number): boolean => {
    return value >= 2 && value <= 10 && Number.isInteger(value);
  };

  const validateIncome = (value: number): boolean => {
    return value > 0 && value <= 200;
  };

  const validateSpending = (value: number): boolean => {
    return value >= 1 && value <= 100;
  };

  const handleClustersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    setNClusters(value);

    if (e.target.value && !validateClusters(value)) {
      setRetrainError("El número de clusters debe estar entre 2 y 10");
    } else {
      setRetrainError("");
    }
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    setAnnualIncome(value);

    if (e.target.value && !validateIncome(value)) {
      setPredictError("El ingreso anual debe estar entre 1 y 200 (en miles)");
    } else {
      setPredictError("");
    }
  };

  const handleSpendingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    setSpendingScore(value);

    if (e.target.value && !validateSpending(value)) {
      setPredictError("La puntuación de gasto debe estar entre 1 y 100");
    } else {
      setPredictError("");
    }
  };

  const retrainModel = async () => {
    if (!validateClusters(nClusters)) {
      setRetrainError("Por favor, ingrese un número válido de clusters (2-10)");
      return;
    }

    setIsRetraining(true);
    setRetrainError("");
    setRetrainResult(null);

    try {
      const result = await ApiService.retrainModel({ n_clusters: nClusters });
      setRetrainResult(result);

      // Extraer el Silhouette Score del mensaje si está disponible
      const scoreMatch = result.message.match(/Silhouette Score=([0-9.]+)/);
      const silhouetteScore = scoreMatch
        ? Number.parseFloat(scoreMatch[1])
        : undefined;

      // Guardar en el historial
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        params: { n_clusters: nClusters, timestamp: Date.now() },
        result: { ...result, silhouette_score: silhouetteScore },
        timestamp: Date.now(),
      };

      const history = JSON.parse(
        localStorage.getItem("retrainHistory") || "[]"
      );
      history.unshift(historyEntry);
      localStorage.setItem(
        "retrainHistory",
        JSON.stringify(history.slice(0, 10))
      );
    } catch (error) {
      console.error("Error de reentrenamiento:", error);
      setRetrainError(
        `Sucedió un error inesperado. Vuelva a intentarlo más tarde`
      );
    } finally {
      setIsRetraining(false);
    }
  };

  const predictCustomer = async () => {
    if (!validateIncome(annualIncome) || !validateSpending(spendingScore)) {
      setPredictError(
        "Por favor, ingrese valores válidos de ingreso (1-200k) y puntuación de gasto (1-100)"
      );
      return;
    }

    setIsPredicting(true);
    setPredictError("");
    setPredictResult(null);

    try {
      const result = await ApiService.predictCustomer({
        annual_income: annualIncome,
        spending_score: spendingScore,
      });
      setPredictResult(result);

      // Guardar predicción en el historial
      const prediction: CustomerPrediction = {
        id: Date.now().toString(),
        annual_income: annualIncome,
        spending_score: spendingScore,
        cluster: result.cluster,
        timestamp: Date.now(),
      };

      const predictions = JSON.parse(
        localStorage.getItem("customerPredictions") || "[]"
      );
      predictions.unshift(prediction);
      localStorage.setItem(
        "customerPredictions",
        JSON.stringify(predictions.slice(0, 20))
      );
    } catch (error) {
      console.error("Error de predicción:", error);
      setPredictError(
        `Sucedió un error inesperado. Vuelva a intentarlo más tarde`
      );
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Clustering K-Means
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dataset de clientes con ingresos anuales y puntuación de gasto.

          </p>
        </div>

        <Tabs defaultValue="retrain" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="retrain" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Reentrenar Modelo
            </TabsTrigger>
            <TabsTrigger value="predict" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Predecir Cliente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="retrain" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Reentrenar Modelo de Clustering
                </CardTitle>
                <CardDescription>
                  Actualice el modelo k-means con un nuevo número de clusters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="clusters-input"
                    className="text-base font-medium"
                  >
                    Número de clusters (K) *
                  </Label>
                  <Input
                    id="clusters-input"
                    type="number"
                    min="2"
                    max="10"
                    value={nClusters}
                    onChange={handleClustersChange}
                    className={`text-lg ${
                      retrainError ? "border-destructive" : ""
                    }`}
                    aria-describedby={
                      retrainError ? "clusters-error" : "clusters-help"
                    }
                    aria-invalid={!!retrainError}
                  />
                  {retrainError ? (
                    <p
                      id="clusters-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {retrainError}
                    </p>
                  ) : (
                    <p
                      id="clusters-help"
                      className="text-sm text-muted-foreground"
                    >
                      Elija entre 2 y 10 clusters para el modelo
                    </p>
                  )}
                </div>

                <Button
                  onClick={retrainModel}
                  disabled={isRetraining || !!retrainError}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {isRetraining ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Reentrenando Modelo...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Reentrenar Modelo
                    </>
                  )}
                </Button>

                {retrainResult && (
                  <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        ¡Modelo Reentrenado Exitosamente!
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        {retrainResult.message}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predict" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Predecir Cluster de Cliente
                </CardTitle>
                <CardDescription>
                  Ingrese datos del cliente para predecir a qué cluster
                  pertenece
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="income-input"
                      className="text-base font-medium"
                    >
                      Ingreso Anual (miles) *
                    </Label>
                    <Input
                      id="income-input"
                      type="number"
                      min="1"
                      max="200"
                      value={annualIncome}
                      onChange={handleIncomeChange}
                      className={`text-lg ${
                        predictError ? "border-destructive" : ""
                      }`}
                      placeholder="ej., 50"
                    />
                    <p className="text-sm text-muted-foreground">
                      Ingrese el ingreso en miles (1-200)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="spending-input"
                      className="text-base font-medium"
                    >
                      Puntuación de Gasto *
                    </Label>
                    <Input
                      id="spending-input"
                      type="number"
                      min="1"
                      max="100"
                      value={spendingScore}
                      onChange={handleSpendingChange}
                      className={`text-lg ${
                        predictError ? "border-destructive" : ""
                      }`}
                      placeholder="ej., 60"
                    />
                    <p className="text-sm text-muted-foreground">
                      Puntuación de 1 a 100
                    </p>
                  </div>
                </div>

                {predictError && (
                  <p className="text-sm text-destructive" role="alert">
                    {predictError}
                  </p>
                )}

                <Button
                  onClick={predictCustomer}
                  disabled={isPredicting || !!predictError}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {isPredicting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Prediciendo...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-5 w-5" />
                      Predecir Cluster
                    </>
                  )}
                </Button>

                {predictResult !== null && (
                  <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Resultado de Predicción
                      </h3>
                      <div className="text-blue-700 dark:text-blue-300">
                        <p className="text-lg">
                          <strong>
                            El cliente pertenece al Cluster:{" "}
                            {predictResult.cluster}
                          </strong>
                        </p>
                        <p className="text-sm mt-2">
                          Ingreso: ${annualIncome}k | Puntuación de Gasto:{" "}
                          {spendingScore}/100
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
