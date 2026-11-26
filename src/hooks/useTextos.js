import { useEffect, useState } from "react";
import useApi from "./useApi";

const pendientes = new Map();

function solicitarTextos(solicitar, idioma) {
  // StrictMode vuelve a ejecutar el efecto en desarrollo: reutiliza la petición
  // pendiente en vez de iniciar otro GET para los mismos textos.
  if (pendientes.has(idioma)) return pendientes.get(idioma);

  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), 12000);
  const promesa = (async () => {
    try {
      const respuesta = await solicitar(`/textos?idioma=${encodeURIComponent(idioma)}`, {
        signal: controlador.signal,
      });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos = await respuesta.json();
      if (!datos?.textos || typeof datos.textos !== "object" || Array.isArray(datos.textos)) {
        throw new Error("Respuesta de textos inválida");
      }
      return datos.textos;
    } finally {
      clearTimeout(limite);
      pendientes.delete(idioma);
    }
  })();

  pendientes.set(idioma, promesa);
  return promesa;
}

export function useTextos(idioma) {
  const solicitar = useApi();
  const [estado, setEstado] = useState({ idioma, textos: null, cargando: true, error: false });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado({ idioma, textos: null, cargando: true, error: false });

    solicitarTextos(solicitar, idioma).then(
      (textos) => {
        if (vigente) setEstado({ idioma, textos, cargando: false, error: false });
      },
      (error) => {
        if (vigente) {
          console.error("Error al cargar los textos:", error);
          setEstado({ idioma, textos: null, cargando: false, error: true });
        }
      },
    );

    return () => { vigente = false; };
  }, [solicitar, idioma, intento]);

  const actual = estado.idioma === idioma ? estado : { textos: null, cargando: true, error: false };
  return {
    textos: actual.textos,
    cargando: actual.cargando,
    error: actual.error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}
