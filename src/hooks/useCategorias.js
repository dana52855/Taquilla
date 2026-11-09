import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL + '/categorias';

const CLAVES_MENU = ["inicio", "explorar"]

function useCategorias() {
  const [categorias, setCategorias] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);
    let vigente = true;
    setCargando(true);
    setError(false);
    setCategorias(null);

    async function cargarCategorias() {
      try {
        const respuesta = await fetch(`${API}`, {
          signal: controlador.signal,
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        //Si si respondio los datos correctamente
        const datos = await respuesta.json();
        if (vigente) setCategorias(datos?.datos);
      } catch (error) {
        if (vigente) {
          console.error("Error al cargar las categorias:", error);
          setError(true);
        }
      } finally {
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarCategorias();
    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [intento]);

  return {
    categorias,
    cargando,
    error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}

export default useCategorias;