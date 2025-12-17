"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSession, getSession } from "@/lib/session";
import { createOrUpdateUser } from "@/lib/services/usuarios.service";

export default function AuthPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Si ya hay sesión, redirigir
    const session = getSession();
    if (session) {
      router.push("/reservar");
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    }

    if (!formData.celular.trim()) {
      newErrors.celular = "El celular es requerido";
    } else if (!/^\d{10}$/.test(formData.celular.replace(/\s/g, ""))) {
      newErrors.celular = "Ingrese un número válido de 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Crear o actualizar usuario en Supabase
      const user = await createOrUpdateUser({
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
      });

      if (!user) {
        setErrors({
          celular: "Error al registrar usuario. Intenta nuevamente.",
        });
        setIsLoading(false);
        return;
      }

      // Guardar en sesión local
      saveSession(user);

      // Redirigir a página de reserva
      router.push("/reservar");
    } catch (error) {
      console.error("Error en registro:", error);
      setErrors({ celular: "Error al conectar con el servidor" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-purple-500/20">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl mb-4">
            ✂️
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Barbería El Estilo
          </CardTitle>
          <CardDescription className="text-lg text-gray-400">
            Ingresa tus datos para reservar tu turno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-gray-200">
                Nombre
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="h-12 text-lg border-purple-500/30 focus:border-purple-500"
              />
              {errors.nombre && (
                <p className="text-sm text-red-400">{errors.nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido" className="text-gray-200">
                Apellido
              </Label>
              <Input
                id="apellido"
                type="text"
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
                className="h-12 text-lg border-purple-500/30 focus:border-purple-500"
              />
              {errors.apellido && (
                <p className="text-sm text-red-400">{errors.apellido}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular" className="text-gray-200">
                Número de celular
              </Label>
              <Input
                id="celular"
                type="tel"
                placeholder="Ej: 1234567890"
                value={formData.celular}
                onChange={(e) =>
                  setFormData({ ...formData, celular: e.target.value })
                }
                className="h-12 text-lg border-purple-500/30 focus:border-purple-500"
              />
              {errors.celular && (
                <p className="text-sm text-red-400">{errors.celular}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Registrando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
