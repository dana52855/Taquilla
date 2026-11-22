import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL + "/eventos";

function extraerEvento(respuesta) {
  const datos = respuesta?.datos ?? respuesta?.data ?? respuesta?.evento ?? respuesta;
  if (Array.isArray(datos)) return datos[0] ?? null;
  return datos?.evento ?? datos;
}

function extraerLista(respuesta) {
  const datos = respuesta?.datos ?? respuesta?.data ?? respuesta?.eventos ?? respuesta;
  if (Array.isArray(datos)) return datos;
  return datos?.eventos ?? datos?.resultados ?? datos?.items ?? [];
}

function codigoError(respuesta) {
  return respuesta?.codigo ?? respuesta?.code ?? respuesta?.error?.codigo ?? respuesta?.error?.code ?? (typeof respuesta?.error === "string" ? respuesta.error : undefined);
}

export default function useDetalleEvento(slug) {
  const [evento, setEvento] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [estado, setEstado] = useState("cargando");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!slug) {
      setEstado("no-encontrado");
      return;
    }

    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);
    let vigente = true;

    async function cargarDetalle() {
      setEstado("cargando");
      setEvento(null);
      setRelacionados([]);

      try {
        const respuesta = await fetch(`${API}/${encodeURIComponent(slug)}`, {
          signal: controlador.signal,
        });
        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
          if (respuesta.status === 404 && codigoError(datos) === "no_encontrado") {
            if (vigente) setEstado("no-encontrado");
            return;
          }
          throw new Error(`HTTP ${respuesta.status}`);
        }

        const detalle = extraerEvento(datos);
        if (!detalle || typeof detalle !== "object") {
          throw new Error("La API no devolvió los datos del evento.");
        }

        if (vigente) {
          setEvento(detalle);
          setEstado("listo");
        }

        try {
          const respuestaRelacionados = await fetch(
            `${API}/${encodeURIComponent(slug)}/relacionados`,
            { signal: controlador.signal },
          );

          if (respuestaRelacionados.ok) {
            const datosRelacionados = await respuestaRelacionados.json();
            if (vigente) setRelacionados(extraerLista(datosRelacionados).slice(0, 4));
          }
        } catch (errorRelacionados) {
          if (errorRelacionados.name !== "AbortError") {
            console.error("No se pudieron cargar los eventos relacionados:", errorRelacionados);
          }
        }
      } catch (error) {
        if (vigente && error.name !== "AbortError") {
          console.error("Error al cargar el detalle del evento:", error);
          setEstado("error");
        } else if (vigente && error.name === "AbortError") {
          setEstado("error");
        }
      } finally {
        clearTimeout(limite);
      }
    }

    cargarDetalle();

    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [slug, intento]);

  return {
    evento,
    relacionados,
    estado,
    recargar: () => setIntento((valor) => valor + 1),
  };
}
