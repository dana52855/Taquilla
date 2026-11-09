import { useEffect, useState } from "react";
import { useTextos } from "./hooks/useTextos";
import Tarjeta from "./components/Tarjeta/Tarjeta";
import useEventos from "./hooks/useEventos.js";
import { Route, Routes } from "react-router-dom";
import LayoutPublico from "./layouts/LayoutPublico.jsx";
import Home from "./pages/Home/Home.jsx";

function leerSeccion() {
  return window.location.hash.slice(1) || "inicio";
}

function App() {
  const [idioma, setIdioma] = useState("es");
  const [activo, setActivo] = useState(leerSeccion);
  const [consulta, setConsulta] = useState("");
  const [textoGrande, setTextoGrande] = useState(false);

  const datos = useTextos(idioma);
  const en = idioma === "en";

  const [filtros, setFiltros] = useState({
    consulta: "",
  });

  const destacado = null;

  useEffect(() => {
    function actualizarSeccion() {
      setActivo(leerSeccion());
      setConsulta("");
    }

    window.addEventListener("hashchange", actualizarSeccion);

    return () => {
      window.removeEventListener("hashchange", actualizarSeccion);
    };
  }, []);

  function buscar(valor) {
    setConsulta(valor);
  }

  function abrirEvento(evento) {
    console.log("Evento seleccionado:", evento);
  }

  function filtrarCategoria(categoria) {
    setFiltros({
      consulta: "",
      categoria: categoria,
    });

    document.getElementById("eventos")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  const enlaces = {
    ingresar: '/ingresar',
    crearCuenta: '/crearCuenta',
    explorar: '/eventos',
    terminos: '/terminos-de-uso',
    accesibilidad: '/accesiblidad'
  }

  const { eventos } = useEventos();
  return (
    <div className="sitio">
      <Routes>
        <Route path="/" element={<LayoutPublico
          datos={datos}
          en={en}
          alternarIdioma={() => setIdioma(en ? 'es' : 'en')}
          alternarTexto={() => setTextoGrande(!textoGrande)}
          enlaces={enlaces}
        />}>
          <Route index element={<Home
            datos={datos}
            en={en}
            enlaces={enlaces}
          />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
