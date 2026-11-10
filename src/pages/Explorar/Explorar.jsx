import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Tarjeta from "../../components/Tarjeta/Tarjeta";
import Icono from "../../components/Icono";
import Boton from "../../components/Boton/Boton";
import "./Explorar.css";

const API = import.meta.env.VITE_API_URL;
const POR_PAGINA = 12;
const PLACEHOLDER = "PLACEHOLDER";

function obtenerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.datos)) return respuesta.datos;
  if (Array.isArray(respuesta?.eventos)) return respuesta.eventos;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.resultados)) return respuesta.resultados;
  if (Array.isArray(respuesta?.categorias)) return respuesta.categorias;
  if (Array.isArray(respuesta?.ciudades)) return respuesta.ciudades;
  if (Array.isArray(respuesta?.items)) return respuesta.items;
  return [];
}

function obtenerNombre(valor) {
  if (typeof valor === "string") return valor;
  return valor?.nombre || valor?.ciudad || valor?.name || valor?.titulo || "";
}

function obtenerClaveCategoria(categoria) {
  return String(categoria?.slug || categoria?.clave || categoria?.id || categoria?.nombre || "");
}

function obtenerPaginacion(respuesta) {
  const pagina = respuesta?.paginacion ?? respuesta?.pagination ?? respuesta?.meta;
  const total = Number(
    pagina?.total ?? pagina?.totalRegistros ?? pagina?.totalEventos ??
    respuesta?.total ?? respuesta?.totalRegistros ?? respuesta?.totalEventos
  );
  const paginas = Number(
    pagina?.totalPaginas ?? pagina?.total_pages ?? pagina?.last_page ??
    respuesta?.totalPaginas
  );
  return {
    total: Number.isFinite(total) && total >= 0 ? total : null,
    paginas: Number.isFinite(paginas) && paginas > 0 ? paginas : null,
    paginaServidor: Number.isFinite(total) || Number.isFinite(paginas) || Boolean(pagina?.pagina || pagina?.current_page || pagina?.totalPaginas || pagina?.total_pages),
  };
}

function fechaEvento(evento) {
  const fecha = new Date(evento?.fecha || evento?.fechaInicio || evento?.fecha_inicio || "");
  return Number.isNaN(fecha.getTime()) ? Number.MAX_SAFE_INTEGER : fecha.getTime();
}

function precioEvento(evento) {
  const precio = Number(evento?.precioDesde ?? evento?.precio_desde ?? evento?.precio ?? 0);
  return Number.isFinite(precio) ? precio : 0;
}

function popularidadEvento(evento) {
  return Number(evento?.popularidad ?? evento?.visitas ?? evento?.ventas ?? evento?.reservas ?? 0) || 0;
}

export default function Explorar({ textos, cargando: cargandoTextos, en, enlaces }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const explorar = textos?.paginas?.explorar;
  const filtros = explorar?.filtros;
  const botonesFiltros = filtros?.botones;
  const orden = explorar?.orden;
  const opcionesOrden = orden?.opciones;
  const paginacionTextos = explorar?.paginacion;
  const vacio = explorar?.vacio;
  const botonesVacio = vacio?.botones;
  const categoriaActual = searchParams.get("categoria") || "";
  const ciudadActual = searchParams.get("ciudad") || "";
  const busquedaActual = searchParams.get("q") || "";
  const ordenActual = searchParams.get("orden") || "fecha";
  const paginaActual = Math.max(1, Number(searchParams.get("pagina") || 1) || 1);

  const [busqueda, setBusqueda] = useState(busquedaActual);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paginacion, setPaginacion] = useState({ total: null, paginas: null, paginaServidor: false });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setBusqueda(busquedaActual);
  }, [busquedaActual]);

  useEffect(() => {
    const controlador = new AbortController();
    async function cargarOpciones() {
      try {
        const [respuestaCategorias, respuestaCiudades] = await Promise.all([
          fetch(`${API}/categorias`, { signal: controlador.signal }),
          fetch(`${API}/ciudades`, { signal: controlador.signal }),
        ]);
        if (!respuestaCategorias.ok || !respuestaCiudades.ok) {
          throw new Error("No se pudieron cargar las opciones de filtros.");
        }
        const [datosCategorias, datosCiudades] = await Promise.all([
          respuestaCategorias.json(),
          respuestaCiudades.json(),
        ]);
        setCategorias(obtenerLista(datosCategorias));
        setCiudades(obtenerLista(datosCiudades));
      } catch (errorCarga) {
        if (errorCarga.name !== "AbortError") {
          console.error("Error al cargar filtros de exploración:", errorCarga);
        }
      }
    }
    cargarOpciones();
    return () => controlador.abort();
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    async function cargarEventos() {
      setCargando(true);
      setError(false);
      const parametros = new URLSearchParams();
      if (categoriaActual) parametros.set("categoria", categoriaActual);
      if (ciudadActual) parametros.set("ciudad", ciudadActual);
      if (busquedaActual) parametros.set("q", busquedaActual);
      if (ordenActual) parametros.set("orden", ordenActual);
      parametros.set("pagina", String(paginaActual));
      parametros.set("limite", String(POR_PAGINA));

      try {
        const respuesta = await fetch(`${API}/eventos?${parametros.toString()}`, {
          signal: controlador.signal,
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const datos = await respuesta.json();
        setEventos(obtenerLista(datos));
        setPaginacion(obtenerPaginacion(datos));
      } catch (errorCarga) {
        if (errorCarga.name !== "AbortError") {
          console.error("Error al cargar eventos:", errorCarga);
          setError(true);
          setEventos([]);
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }
    cargarEventos();
    return () => controlador.abort();
  }, [categoriaActual, ciudadActual, busquedaActual, ordenActual, paginaActual, intento]);

  function actualizarFiltros(cambios, limpiar = false) {
    const siguientes = limpiar ? new URLSearchParams() : new URLSearchParams(searchParams);
    Object.entries(cambios).forEach(([clave, valor]) => {
      if (valor === "" || valor === null || valor === undefined) siguientes.delete(clave);
      else siguientes.set(clave, String(valor));
    });
    siguientes.delete("pagina");
    setSearchParams(siguientes);
  }

  function buscar(evento) {
    evento.preventDefault();
    actualizarFiltros({ q: busqueda.trim() });
    setFiltrosAbiertos(false);
  }

  const eventosVisibles = useMemo(() => {
    let resultado = [...eventos];
    if (!paginacion.paginaServidor) {
      if (categoriaActual) {
        resultado = resultado.filter((evento) =>
          String(evento?.categoria?.slug || evento?.categoria?.id || evento?.categoria || "").toLowerCase() === categoriaActual.toLowerCase()
        );
      }
      if (ciudadActual) {
        resultado = resultado.filter((evento) =>
          String(evento?.ciudad?.nombre || evento?.ciudad || evento?.recinto?.ciudad?.nombre || evento?.recinto?.ciudad || "").toLowerCase() === ciudadActual.toLowerCase()
        );
      }
      if (busquedaActual) {
        const q = busquedaActual.toLowerCase();
        resultado = resultado.filter((evento) =>
          [evento?.titulo, evento?.artista, evento?.recinto?.nombre, evento?.descripcion]
            .some((valor) => String(valor || "").toLowerCase().includes(q))
        );
      }
      resultado.sort((a, b) => {
        if (ordenActual === "precio") return precioEvento(a) - precioEvento(b);
        if (ordenActual === "popularidad") return popularidadEvento(b) - popularidadEvento(a);
        return fechaEvento(a) - fechaEvento(b);
      });
    }
    return paginacion.paginaServidor
      ? resultado
      : resultado.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  }, [eventos, paginacion.paginaServidor, categoriaActual, ciudadActual, busquedaActual, ordenActual, paginaActual]);

  const totalEventos = paginacion.total ?? eventos.length;
  const totalPaginas = paginacion.paginas ?? Math.max(1, Math.ceil(totalEventos / POR_PAGINA));

  const texto = (valor) => typeof valor === "string" && valor.trim() ? valor : PLACEHOLDER;
  const textoResultados = totalEventos === 1
    ? explorar?.resultados?.uno
    : explorar?.resultados?.otro;
  const textoResultadosCorto = totalEventos === 1
    ? explorar?.resultadosCorto?.uno
    : explorar?.resultadosCorto?.otro;

  function controlesFiltros() {
    return (
      <div className="explorar-filtros-contenido">
        <div className="explorar-filtros-cabecera">
          <h2 className="titular-h3">{texto(filtros?.titulo)}</h2>
          <button className="explorar-limpiar" type="button" onClick={() => { actualizarFiltros({}, true); setBusqueda(""); }}>
            {texto(botonesFiltros?.limpiar)}
          </button>
        </div>

        <fieldset className="explorar-filtro-grupo explorar-categorias-opciones">
          <legend className="cuerpo-p-fuerte">{texto(filtros?.categoria)}</legend>
          {categorias.map((categoria) => {
            const clave = obtenerClaveCategoria(categoria);
            const cantidad = categoria?.eventos ?? categoria?.cantidadEventos ?? categoria?.totalEventos;
            return (
              <label className="explorar-categoria-opcion" key={clave}>
                <input
                  type="checkbox"
                  checked={categoriaActual === clave}
                  onChange={(evento) => actualizarFiltros({ categoria: evento.target.checked ? clave : "" })}
                />
                <span>{obtenerNombre(categoria)}</span>
                {cantidad !== undefined && cantidad !== null && <small>{cantidad}</small>}
              </label>
            );
          })}
        </fieldset>

        <div className="explorar-filtro-grupo">
          <label className="cuerpo-p-fuerte" htmlFor="explorar-ciudad">{texto(filtros?.ciudad)}</label>
          <select id="explorar-ciudad" className="explorar-select" value={ciudadActual} onChange={(evento) => actualizarFiltros({ ciudad: evento.target.value })}>
            <option value="">{texto(PLACEHOLDER)}</option>
            {ciudades.map((ciudad, indice) => {
              const nombre = obtenerNombre(ciudad);
              const valor = typeof ciudad === "string" ? ciudad : ciudad?.nombre || ciudad?.ciudad || ciudad?.slug || ciudad?.id || nombre;
              return <option key={String(valor || indice)} value={valor}>{nombre}</option>;
            })}
          </select>
        </div>

        <div className="explorar-filtro-grupo">
          <label className="cuerpo-p-fuerte" htmlFor="explorar-busqueda">{texto(PLACEHOLDER)}</label>
          <form className="explorar-busqueda" onSubmit={buscar}>
            <Icono nombre="search" />
            <input id="explorar-busqueda" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder={texto(PLACEHOLDER)} />
            <button type="submit" aria-label={texto(PLACEHOLDER)}><Icono nombre="arrowr" /></button>
          </form>
        </div>
        <div className="explorar-filtros-acciones-movil">
          <Boton tipo="primario" className="cuerpo-p-fuerte" onClick={() => { actualizarFiltros({ q: busqueda.trim() }); setFiltrosAbiertos(false); }}>
            {texto(botonesFiltros?.verResultados)}
          </Boton>
        </div>
      </div>
    );
  }

  if (cargandoTextos) {
    return <div className="explorar-cargando titular-h3">{PLACEHOLDER}</div>;
  }

  return (
    <div className="pagina-explorar">
      <section className="explorar-encabezado">
        <div className="explorar-migas cuerpo-p">
          <Link to={enlaces?.inicio || "/"}>{texto(textos?.navbar?.enlaces?.inicio)}</Link>
          <Icono nombre="chevr" />
          <span>{texto(explorar?.seo?.titulo)}</span>
        </div>
        <h1 className="titular-h1">{texto(explorar?.seo?.titulo)}</h1>
        <p className="cuerpo-m explorar-resumen">
          {texto(textoResultados)?.replace("{cantidad}", totalEventos)}
        </p>
      </section>

      <section className="explorar-cuerpo">
        <aside className="explorar-filtros-escritorio">{controlesFiltros()}</aside>

        <div className="explorar-resultados">
          <div className="explorar-barra-resultados">
            <button type="button" className="explorar-abrir-filtros" onClick={() => setFiltrosAbiertos(true)}>
              <Icono nombre="sliders" />
              {texto(filtros?.titulo)}
            </button>
            <label className="explorar-orden">
              <span className="cuerpo-p">{texto(orden?.etiqueta)}</span>
              <select className="explorar-select explorar-select-orden" value={ordenActual} onChange={(evento) => actualizarFiltros({ orden: evento.target.value })}>
                <option value="fecha">{texto(opcionesOrden?.fecha)}</option>
                <option value="precio">{texto(opcionesOrden?.precio)}</option>
                <option value="popularidad">{texto(opcionesOrden?.popularidad)}</option>
              </select>
            </label>
          </div>

          {cargando ? (
            <div className="explorar-estado titular-h3">{PLACEHOLDER}</div>
          ) : error ? (
            <div className="explorar-estado">
              <p className="cuerpo-m">{texto(PLACEHOLDER)}</p>
              <button type="button" className="explorar-limpiar" onClick={() => setIntento((actual) => actual + 1)}>{texto(PLACEHOLDER)}</button>
            </div>
          ) : eventosVisibles.length === 0 ? (
            <div className="explorar-vacio">
              <h2 className="titular-h3">{texto(vacio?.titulo)}</h2>
              <p className="cuerpo-p">{texto(vacio?.texto)}</p>
              <button type="button" className="explorar-limpiar" onClick={() => { actualizarFiltros({}, true); setBusqueda(""); }}>{texto(botonesVacio?.limpiar)}</button>
            </div>
          ) : (
            <div className="explorar-grid">
              {eventosVisibles.map((evento, indice) => (
                <div className="explorar-tarjeta" key={evento?.id || evento?.slug || indice}>
                  <Tarjeta textos={textos} evento={evento} en={en} />
                </div>
              ))}
            </div>
          )}

          {!cargando && !error && totalPaginas > 1 && (
            <nav className="explorar-paginacion" aria-label={texto(paginacionTextos?.anterior)}>
              <button type="button" disabled={paginaActual <= 1} onClick={() => setSearchParams((actuales) => { const siguientes = new URLSearchParams(actuales); siguientes.set("pagina", String(paginaActual - 1)); return siguientes; })} aria-label={texto(paginacionTextos?.anterior)}>
                <Icono nombre="chevl" />
              </button>
              {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((pagina) => (
                <button key={pagina} type="button" className={pagina === paginaActual ? "activa" : ""} aria-current={pagina === paginaActual ? "page" : undefined} onClick={() => setSearchParams((actuales) => { const siguientes = new URLSearchParams(actuales); siguientes.set("pagina", String(pagina)); return siguientes; })}>
                  {pagina}
                </button>
              ))}
              <button type="button" disabled={paginaActual >= totalPaginas} onClick={() => setSearchParams((actuales) => { const siguientes = new URLSearchParams(actuales); siguientes.set("pagina", String(paginaActual + 1)); return siguientes; })} aria-label={texto(paginacionTextos?.siguiente)}>
                <Icono nombre="chevr" />
              </button>
            </nav>
          )}
        </div>
      </section>

      {filtrosAbiertos && (
        <div className="explorar-panel-capa" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setFiltrosAbiertos(false); }}>
          <section className="explorar-panel" role="dialog" aria-modal="true" aria-label={texto(filtros?.titulo)}>
            <div className="explorar-panel-titulo">
              <h2 className="titular-h3">{texto(filtros?.titulo)}</h2>
              <button type="button" className="explorar-cerrar-panel" onClick={() => setFiltrosAbiertos(false)} aria-label={texto(PLACEHOLDER)}><Icono nombre="x" /></button>
            </div>
            {controlesFiltros()}
          </section>
        </div>
      )}
    </div>
  );
}
