import { useEffect, useState } from "react";
import useApi from "./useApi";

export default function useCiudades() {
  const [ciudades, setCiudades] = useState([]);
  const solicitar = useApi();

  useEffect(() => {
    const controlador = new AbortController();
    async function cargar() {
      try {
        const respuesta = await solicitar("/ciudades", { signal: controlador.signal });
        if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
        const datos = await respuesta.json();
        const lista = datos?.datos ?? datos?.ciudades ?? datos?.data ?? datos;
        if (Array.isArray(lista) && !controlador.signal.aborted) {
          setCiudades(lista.map((ciudad) => typeof ciudad === "string" ? ciudad : ciudad?.nombre ?? ciudad?.ciudad ?? ciudad?.name).filter((nombre) => typeof nombre === "string" && nombre));
        }
      } catch (error) {
        if (error.name !== "AbortError") console.error(error);
      }
    }
    cargar();
    return () => controlador.abort();
  }, [solicitar]);

  return ciudades;
}
