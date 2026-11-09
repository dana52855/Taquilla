import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL + "/eventos";

function useEventos(destacados = false) {
  const [eventos, setEventos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 12000);

    let vigente = true;
    setCargando(true);
    setError(false);
    setEventos(null);

    async function cargarEventos() {
      try {
        const respuesta = await fetch(
          `${API}${destacados ? "/destacados" : ""}`,
          {
            signal: controlador.signal,
          },
        );
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const datos = await respuesta.json();
        console.log(datos)
        if (vigente) setEventos(datos?.datos);
      } catch (error) {
        if (vigente) {
          console.error("Error al cargar los eventos:", error);
          setError(true);
        }
      } finally {
        clearTimeout(temporizador);
        if (vigente) setCargando(false);
      }
    }

    cargarEventos();
    return () => {
      vigente = false;
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [intento, destacados]);
  return {
    eventos,
    cargando,
    error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}

export default useEventos;
