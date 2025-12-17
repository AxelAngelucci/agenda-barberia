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
import { createClient } from "@/lib/supabase/client-browser";

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    direccion: "",
    telefono: "",
  });
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // Set origin only on client side
    setOrigin(window.location.origin);

    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      // Verificar si ya tiene barbería registrada
      const { data: barberia } = await supabase
        .from("barberias")
        .select("*")
        .eq("id", user.id)
        .single();

      if (barberia) {
        // Ya tiene barbería, redirigir a admin
        router.push("/admin");
      } else {
        // Prellenar con datos de Google
        setUserEmail(user.email || "");
        setFormData((prev) => ({
          ...prev,
          nombre: user.user_metadata.full_name || user.user_metadata.name || "",
        }));
      }
    });
  }, [router]);

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, ""); // Quitar guiones al inicio y final
  };

  const handleNombreChange = (nombre: string) => {
    setFormData((prev) => ({
      ...prev,
      nombre,
      slug: generateSlug(nombre),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }

      // Crear barbería
      const { error: insertError } = await supabase.from("barberias").insert({
        id: user.id,
        nombre: formData.nombre,
        slug: formData.slug,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: user.email,
      } as any);

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique constraint violation
          setError("Este nombre ya está en uso. Por favor, elige otro.");
        } else {
          setError("Error al crear barbería: " + insertError.message);
        }
        setIsLoading(false);
        return;
      }

      // Redirigir al dashboard
      router.push("/admin");
    } catch (err) {
      console.error("Error en onboarding:", err);
      setError("Error al crear barbería. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-purple-500/20">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl mb-4">
            ✂️
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Configura tu Barbería
          </CardTitle>
          <CardDescription className="text-lg text-gray-400">
            Completa la información para comenzar a recibir reservas
          </CardDescription>
          {userEmail && (
            <p className="text-sm text-gray-500">
              Registrando como:{" "}
              <span className="text-purple-400">{userEmail}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-gray-200">
                Nombre de tu Barbería *
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: Barbería El Estilo"
                value={formData.nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                className="h-12 text-lg border-purple-500/30 focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-gray-200">
                URL de tu agenda
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {origin}/agenda/
                </span>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="h-12 border-purple-500/30 focus:border-purple-500"
                  required
                  pattern="[a-z0-9-]+"
                  title="Solo minúsculas, números y guiones"
                />
              </div>
              <p className="text-xs text-gray-500">
                Esta será la URL que compartirás con tus clientes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-gray-200">
                Dirección
              </Label>
              <Input
                id="direccion"
                type="text"
                placeholder="Ej: Av. Principal 123, Centro"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="h-12 border-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-gray-200">
                Teléfono de contacto
              </Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="Ej: 1234567890"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="h-12 border-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Nota:</strong> Después podrás configurar tus
                horarios, precios y servicios desde el panel de administración.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.nombre || !formData.slug}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Creando barbería..." : "Crear mi Barbería →"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
