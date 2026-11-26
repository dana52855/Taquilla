import { useEffect, useState } from "react";
import { useTextos } from "./hooks/useTextos";
import { Route, Routes, useNavigate } from "react-router-dom";
import LayoutPublico from "./layouts/LayoutPublico.jsx";
import Home from "./pages/Home/Home.jsx";
import Explorar from "./pages/Explorar/Explorar.jsx";
import DetalleEvento from "./pages/DetalleEvento/DetalleEvento.jsx";
import IniciarSesion from "./pages/IniciarSesion/IniciarSesion.jsx";

const API = "https://yanethm-taquilla-api.fly.dev/api/v1";

function App() {
  const navigate = useNavigate();
  const [consentimiento, setConsentimiento] = useState(() => {
    const guardado = leerCookie("consentimiento");
    return guardado === "aceptado" || guardado === "rechazado" ? guardado : null;
  });
  const [idioma, setIdioma] = useState(() => {
    return leerCookie("consentimiento") === "aceptado"
      ? (leerCookie("idioma") === "en" ? "en" : "es")
      : "es";
  });
  const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // Consulta la cookie httpOnly del servidor al cargar y al volver a la pestaña.
  useEffect(() => {
    let vigente = true;

    async function consultarSesion() {
      try {
        const respuesta = await fetch(`${API}/sesion`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (respuesta.status === 401) {
          if (vigente) {
            setUsuario(null);
            if (usuario) navigate("/ingresar", { replace: true });
          }
          return;
        }

        if (!respuesta.ok) throw new Error("No se pudo consultar la sesión.");

        const datosSesion = await respuesta.json();
        const persona =
          datosSesion?.usuario ??
          datosSesion?.datos?.usuario ??
          datosSesion?.data?.usuario ??
          datosSesion?.datos ??
          datosSesion?.data ??
          datosSesion;

        if (vigente) setUsuario(persona);
      } catch (error) {
        console.error("No se pudo recuperar la sesión:", error);
      }
    }

    consultarSesion();
    window.addEventListener("focus", consultarSesion);

    return () => {
      vigente = false;
      window.removeEventListener("focus", consultarSesion);
    };
  }, [navigate, usuario]);

  async function cerrarSesion() {
    const respuesta = await fetch(`${API}/sesion`, {
      method: "DELETE",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!respuesta.ok && respuesta.status !== 401) {
      throw new Error("No fue posible cerrar sesión. Inténtalo nuevamente.");
    }

    setUsuario(null);
    navigate("/", { replace: true });
  }

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
    ingresar: "/ingresar",
    crearCuenta: "/crearCuenta",
    inicio: "/",
    eventos: "/eventos",
    explorar: "/explorar",
    terminos: "/terminos-de-uso",
    accesibilidad: "/accesibilidad",
  };

  return (
    <div className="sitio">
      <Routes>
        <Route path="/ingresar" element={<IniciarSesion onSesionIniciada={setUsuario} />} />
        <Route
          path="/"
          element={
            <LayoutPublico
              datos={datos}
              en={en}
              alternarIdioma={alternarIdioma}
              enlaces={enlaces}
              usuario={usuario}
              onCerrarSesion={cerrarSesion}
              consentimiento={consentimiento}
              onAceptarCookies={aceptarCookies}
              onRechazarCookies={rechazarCookies}
              accesibilidadAbierta={accesibilidadAbierta}
              onAbrirAccesibilidad={() => setAccesibilidadAbierta(true)}
              onCerrarAccesibilidad={() => setAccesibilidadAbierta(false)}
            />
          }
        >
          <Route
            index
            element={<Home {...datos} en={en} enlaces={enlaces} />}
          />
          <Route
            path="explorar"
            element={<Explorar {...datos} en={en} enlaces={enlaces} />}
          />
          <Route
            path="eventos/:slug"
            element={<DetalleEvento {...datos} en={en} enlaces={enlaces} />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
