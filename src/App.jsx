import { useEffect, useState } from "react";
import { useTextos } from "./hooks/useTextos";
import { Route, Routes } from "react-router-dom";
import LayoutPublico from "./layouts/LayoutPublico.jsx";
import Home from "./pages/Home/Home.jsx";
import Explorar from "./pages/Explorar/Explorar.jsx";

const DURACION_COOKIE = 60 * 60 * 24 * 365;

function leerCookie(nombre) {
  const prefijo = `${nombre}=`;
  const encontrada = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefijo));

  return encontrada ? decodeURIComponent(encontrada.slice(prefijo.length)) : null;
}

function guardarCookie(nombre, valor) {
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; max-age=${DURACION_COOKIE}; path=/; SameSite=Lax`;
}

function eliminarCookie(nombre) {
  document.cookie = `${nombre}=; max-age=0; path=/; SameSite=Lax`;
}

function App() {
  const [consentimiento, setConsentimiento] = useState(() => leerCookie("consentimiento"));
  const [idioma, setIdioma] = useState(() => {
    return leerCookie("consentimiento") === "aceptado"
      ? leerCookie("idioma") || "es"
      : "es";
  });
  const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(false);

  const datos = useTextos(idioma);
  const en = idioma === "en";

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  function aceptarCookies() {
    guardarCookie("consentimiento", "aceptado");
    guardarCookie("idioma", idioma);
    setConsentimiento("aceptado");
  }

  function rechazarCookies() {
    guardarCookie("consentimiento", "rechazado");
    eliminarCookie("idioma");
    setConsentimiento("rechazado");
  }

  function alternarIdioma() {
    const nuevoIdioma = en ? "es" : "en";
    setIdioma(nuevoIdioma);

    if (consentimiento === "aceptado") {
      guardarCookie("idioma", nuevoIdioma);
    }
  }

  const enlaces = {
    ingresar: '/ingresar',
    crearCuenta: '/crearCuenta',
    inicio: '/',
    eventos: '/eventos',
    explorar: '/explorar',
    terminos: '/terminos-de-uso',
    accesibilidad: '/accesibilidad'
  };

  return (
    <div className="sitio">
      <Routes>
        <Route path="/" element={<LayoutPublico
          datos={datos}
          en={en}
          alternarIdioma={alternarIdioma}
          enlaces={enlaces}
          consentimiento={consentimiento}
          onAceptarCookies={aceptarCookies}
          onRechazarCookies={rechazarCookies}
          accesibilidadAbierta={accesibilidadAbierta}
          onAbrirAccesibilidad={() => setAccesibilidadAbierta(true)}
          onCerrarAccesibilidad={() => setAccesibilidadAbierta(false)}
        />}>
          <Route index element={<Home
            {...datos}
            en={en}
            enlaces={enlaces}
          />} />
          <Route path="explorar" element={<Explorar
            {...datos}
            en={en}
            enlaces={enlaces}
          />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
