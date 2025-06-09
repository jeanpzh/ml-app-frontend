"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import type { HistoryEntry, CustomerPrediction } from "@/types/clustering";

export default function HistoryPage() {
  const router = useRouter();
  const [retrainHistory, setRetrainHistory] = useState<HistoryEntry[]>([]);
  const [customerPredictions, setCustomerPredictions] = useState<
    CustomerPrediction[]
  >([]);

  useEffect(() => {
    const storedRetrainHistory = localStorage.getItem("retrainHistory");
    if (storedRetrainHistory) {
      setRetrainHistory(JSON.parse(storedRetrainHistory));
    }

    const storedPredictions = localStorage.getItem("customerPredictions");
    if (storedPredictions) {
      setCustomerPredictions(JSON.parse(storedPredictions));
    }
  }, []);

  const clearRetrainHistory = () => {
    localStorage.removeItem("retrainHistory");
    setRetrainHistory([]);
  };

  const clearPredictionHistory = () => {
    localStorage.removeItem("customerPredictions");
    setCustomerPredictions([]);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES");
  };

  const getSilhouetteScoreColor = (score?: number) => {
    if (!score) return "bg-gray-500";
    if (score >= 0.7) return "bg-green-500";
    if (score >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Historial</h1>
            <p className="text-muted-foreground">
              Ver el historial de reentrenamiento y predicciones
            </p>
          </div>
        </div>

        <Tabs defaultValue="retrain" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="retrain" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Reentrenamiento ({retrainHistory.length})
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Predicciones ({customerPredictions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="retrain" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Historial de Reentrenamiento
              </h2>
              {retrainHistory.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={clearRetrainHistory}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Borrar Historial
                </Button>
              )}
            </div>

            {retrainHistory.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    No hay historial de reentrenamiento
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Reentrene su primer modelo para ver resultados aquí
                  </p>
                  <Button onClick={() => router.push("/")}>
                    Comenzar Reentrenamiento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {retrainHistory.map((entry) => (
                  <Card
                    key={entry.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            K = {entry.params.n_clusters} Clusters
                            {entry.result.silhouette_score && (
                              <Badge
                                className={`${getSilhouetteScoreColor(
                                  entry.result.silhouette_score
                                )} text-white`}
                              >
                                Puntuación:{" "}
                                {entry.result.silhouette_score.toFixed(4)}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(entry.timestamp)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {entry.result.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Historial de Predicciones
              </h2>
              {customerPredictions.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={clearPredictionHistory}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Borrar Historial
                </Button>
              )}
            </div>

            {customerPredictions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    No hay predicciones aún
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Haga su primera predicción de cliente para ver resultados
                    aquí
                  </p>
                  <Button onClick={() => router.push("/")}>
                    Comenzar Predicciones
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {customerPredictions.map((prediction) => (
                  <Card
                    key={prediction.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Cluster {prediction.cluster}
                            <Badge variant="outline">
                              ${prediction.annual_income}k ingresos
                            </Badge>
                            <Badge variant="outline">
                              {prediction.spending_score}/100 gasto
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {formatDate(prediction.timestamp)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Ingreso Anual:
                          </span>
                          <div className="font-medium">
                            ${prediction.annual_income},000
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Puntuación de Gasto:
                          </span>
                          <div className="font-medium">
                            {prediction.spending_score}/100
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
