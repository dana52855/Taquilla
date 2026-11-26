const API = import.meta.env.VITE_API_URL;

function solicitar(ruta, opciones) {
  if (!API) return Promise.reject(new Error("VITE_API_URL"));
  return fetch(`${API.replace(/\/$/, "")}${ruta}`, opciones);
}

// Las páginas y App comparten el cliente; la URL solo se configura en .env.
export default function useApi() {
  return solicitar;
}
