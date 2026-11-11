import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Tarjeta from "../../components/Tarjeta/Tarjeta";
import Icono from "../../components/Icono";
import Boton from "../../components/Boton/Boton";
import "./Explorar.css";

const API = import.meta.env.VITE_API_URL;
const POR_PAGINA = 12;
const PLACEHOLDER = "PLACEHOLDER";
const PRECIO_MINIMO = 30000;
const PRECIO_MAXIMO = 150000;

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

function fechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function rangoFecha(tipo) {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const fin = new Date(inicio);

  if (tipo === "finSemana") {
    const dia = inicio.getDay();
    const diasHastaSabado = dia === 0 ? 6 : 6 - dia;
    inicio.setDate(inicio.getDate() + diasHastaSabado);
    fin.setDate(inicio.getDate() + 1);
  } else if (tipo === "mes") {
    inicio.setDate(1);
    fin.setMonth(fin.getMonth() + 1, 0);
  }

  return { desde: fechaLocal(inicio), hasta: fechaLocal(fin) };
}

function formatoPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
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

  const categoriasActuales = searchParams.getAll("categoria").flatMap((valor) => valor.split(",")).filter(Boolean);
  const ciudadActual = searchParams.get("ciudad") || "";
  const busquedaActual = searchParams.get("q") || "";
  const ordenActual = searchParams.get("orden") || "fecha";
  const paginaActual = Math.max(1, Number(searchParams.get("pagina") || 1) || 1);
  const fechaDesde = searchParams.get("desde") || "";
  const fechaHasta = searchParams.get("hasta") || "";
  const precioDesde = Math.max(PRECIO_MINIMO, Number(searchParams.get("precioMin") || PRECIO_MINIMO));
  const precioHasta = Math.min(PRECIO_MAXIMO, Number(searchParams.get("precioMax") || PRECIO_MAXIMO));

  const [busqueda, setBusqueda] = useState(busquedaActual);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [fechaPersonalizadaDesde, setFechaPersonalizadaDesde] = useState(fechaDesde);
  const [fechaPersonalizadaHasta, setFechaPersonalizadaHasta] = useState(fechaHasta);
  const [precioTemporalDesde, setPrecioTemporalDesde] = useState(precioDesde);
  const [precioTemporalHasta, setPrecioTemporalHasta] = useState(precioHasta);
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paginacion, setPaginacion] = useState({ total: null, paginas: null, paginaServidor: false });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setBusqueda(busquedaActual);
    setFechaPersonalizadaDesde(fechaDesde);
    setFechaPersonalizadaHasta(fechaHasta);
    setPrecioTemporalDesde(precioDesde);
    setPrecioTemporalHasta(precioHasta);
  }, [busquedaActual, fechaDesde, fechaHasta, precioDesde, precioHasta]);

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
      categoriasActuales.forEach((categoria) => parametros.append("categoria", categoria));
      if (ciudadActual) parametros.set("ciudad", ciudadActual);
      if (busquedaActual) parametros.set("q", busquedaActual);
      if (ordenActual) parametros.set("orden", ordenActual);
      if (fechaDesde) parametros.set("desde", fechaDesde);
      if (fechaHasta) parametros.set("hasta", fechaHasta);
      if (precioDesde > PRECIO_MINIMO) parametros.set("precioMin", String(precioDesde));
      if (precioHasta < PRECIO_MAXIMO) parametros.set("precioMax", String(precioHasta));
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
  }, [categoriasActuales.join("|"), ciudadActual, busquedaActual, ordenActual, paginaActual, fechaDesde, fechaHasta, precioDesde, precioHasta, intento]);

  function actualizarFiltros(cambios, limpiar = false) {
    const siguientes = limpiar ? new URLSearchParams() : new URLSearchParams(searchParams);
    Object.entries(cambios).forEach(([clave, valor]) => {
      siguientes.delete(clave);
      if (Array.isArray(valor)) {
        valor.filter(Boolean).forEach((item) => siguientes.append(clave, String(item)));
      } else if (valor !== "" && valor !== null && valor !== undefined) {
        siguientes.set(clave, String(valor));
      }
    });
    siguientes.delete("pagina");
    setSearchParams(siguientes);
  }

  function alternarCategoria(clave) {
    const seleccionadas = categoriasActuales.includes(clave)
      ? categoriasActuales.filter((categoria) => categoria !== clave)
      : [...categoriasActuales, clave];
    actualizarFiltros({ categoria: seleccionadas });
  }

  function aplicarFecha(tipo) {
    if (!tipo) {
      actualizarFiltros({ desde: "", hasta: "" });
      return;
    }
    const rango = rangoFecha(tipo);
    actualizarFiltros(rango);
  }

  function aplicarFechaPersonalizada() {
    actualizarFiltros({
      desde: fechaPersonalizadaDesde,
      hasta: fechaPersonalizadaHasta,
    });
  }

  function aplicarPrecio() {
    actualizarFiltros({
      precioMin: precioTemporalDesde <= PRECIO_MINIMO ? "" : precioTemporalDesde,
      precioMax: precioTemporalHasta >= PRECIO_MAXIMO ? "" : precioTemporalHasta,
    });
  }

  function buscar(evento) {
    evento.preventDefault();
    actualizarFiltros({ q: busqueda.trim() });
    setFiltrosAbiertos(false);
  }

  const eventosVisibles = useMemo(() => {
    let resultado = [...eventos];
    if (!paginacion.paginaServidor) {
      if (categoriasActuales.length) {
        resultado = resultado.filter((evento) => {
          const clave = String(evento?.categoria?.slug || evento?.categoria?.id || evento?.categoria || "").toLowerCase();
          return categoriasActuales.some((categoria) => categoria.toLowerCase() === clave);
        });
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
      if (fechaDesde || fechaHasta) {
        resultado = resultado.filter((evento) => {
          const fecha = fechaEvento(evento);
          if (fecha === Number.MAX_SAFE_INTEGER) return false;
          const dia = fechaLocal(new Date(fecha));
          return (!fechaDesde || dia >= fechaDesde) && (!fechaHasta || dia <= fechaHasta);
        });
      }
      resultado = resultado.filter((evento) => {
        const precio = precioEvento(evento);
        return precio >= precioDesde && precio <= precioHasta;
      });
      resultado.sort((a, b) => {
        if (ordenActual === "precio") return precioEvento(a) - precioEvento(b);
        if (ordenActual === "popularidad") return popularidadEvento(b) - popularidadEvento(a);
        return fechaEvento(a) - fechaEvento(b);
      });
    }
    return paginacion.paginaServidor
      ? resultado
      : resultado.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  }, [eventos, paginacion.paginaServidor, categoriasActuales.join("|"), ciudadActual, busquedaActual, ordenActual, paginaActual, fechaDesde, fechaHasta, precioDesde, precioHasta]);

  const totalEventos = paginacion.total ?? eventos.length;
  const totalPaginas = paginacion.paginas ?? Math.max(1, Math.ceil(totalEventos / POR_PAGINA));
  const textoResultados = totalEventos === 1 ? explorar?.resultados?.uno : explorar?.resultados?.otro;

  const categoriasActivas = categorias.filter((categoria) => categoriasActuales.includes(obtenerClaveCategoria(categoria)));
  const hayFiltrosActivos = categoriasActuales.length > 0 || Boolean(ciudadActual || busquedaActual || fechaDesde || fechaHasta) || precioDesde > PRECIO_MINIMO || precioHasta < PRECIO_MAXIMO;

  function controlesFiltros(movil = false) {
    const fechaActiva = fechaDesde && fechaHasta
      ? fechaDesde === fechaHasta ? "hoy" : "personalizada"
      : fechaDesde ? "desde" : "";

    return (
      <div className={`explorar-filtros-contenido ${movil ? "explorar-filtros-contenido-movil" : ""}`}>
        {!movil && (
          <div className="explorar-filtros-cabecera">
            <h2 className="titular-h3">{filtros?.titulo ?? PLACEHOLDER}</h2>
            <button className="explorar-limpiar" type="button" onClick={() => { actualizarFiltros({}, true); setBusqueda(""); }}>
              {botonesFiltros?.limpiar ?? PLACEHOLDER}
            </button>
          </div>
        )}

        <section className="explorar-filtro-grupo explorar-categorias-opciones">
          <h3 className="cuerpo-p-fuerte">{filtros?.categoria ?? PLACEHOLDER}</h3>
          <div className={movil ? "explorar-chips" : "explorar-lista-categorias"}>
            {categorias.map((categoria) => {
              const clave = obtenerClaveCategoria(categoria);
              const cantidad = categoria?.eventos ?? categoria?.cantidadEventos ?? categoria?.totalEventos;
              const activa = categoriasActuales.includes(clave);
              return movil ? (
                <button key={clave} type="button" className={`explorar-chip ${activa ? "activo" : ""}`} aria-pressed={activa} onClick={() => alternarCategoria(clave)}>
                  {obtenerNombre(categoria)}
                </button>
              ) : (
                <label className="explorar-categoria-opcion" key={clave}>
                  <input type="checkbox" checked={activa} onChange={() => alternarCategoria(clave)} />
                  <span>{obtenerNombre(categoria)}</span>
                  {cantidad !== undefined && cantidad !== null && <small>{cantidad}</small>}
                </label>
              );
            })}
          </div>
        </section>

        <div className="explorar-filtro-separador" />

        <section className="explorar-filtro-grupo">
          <h3 className="cuerpo-p-fuerte">{filtros?.fecha ?? PLACEHOLDER}</h3>
          <div className="explorar-chips explorar-chips-fecha">
            {[
              ["hoy", filtros?.fechas?.hoy],
              ["finSemana", filtros?.fechas?.finSemana],
              ["mes", filtros?.fechas?.mes],
            ].filter((opcion) => opcion[1]).map(([clave, etiqueta]) => {
              const rango = rangoFecha(clave);
              const activo = fechaDesde === rango.desde && fechaHasta === rango.hasta;
              return <button key={clave} type="button" className={`explorar-chip ${activo ? "activo" : ""}`} aria-pressed={activo} onClick={() => aplicarFecha(activo ? "" : clave)}>{etiqueta}</button>;
            })}
            {filtros?.fechas?.elegir && (
              <button type="button" className={`explorar-chip ${fechaActiva === "personalizada" ? "activo" : ""}`} onClick={() => document.getElementById(movil ? "explorar-fecha-desde-movil" : "explorar-fecha-desde")?.focus()}>
                {filtros.fechas.elegir}
              </button>
            )}
          </div>
          <div className="explorar-fechas-personalizadas">
            <label htmlFor={movil ? "explorar-fecha-desde-movil" : "explorar-fecha-desde"}>{filtros?.fechas?.desde ?? PLACEHOLDER}</label>
            <input id={movil ? "explorar-fecha-desde-movil" : "explorar-fecha-desde"} type="date" value={fechaPersonalizadaDesde} onChange={(evento) => setFechaPersonalizadaDesde(evento.target.value)} />
            <label htmlFor={movil ? "explorar-fecha-hasta-movil" : "explorar-fecha-hasta"}>{filtros?.fechas?.hasta ?? PLACEHOLDER}</label>
            <input id={movil ? "explorar-fecha-hasta-movil" : "explorar-fecha-hasta"} type="date" min={fechaPersonalizadaDesde || undefined} value={fechaPersonalizadaHasta} onChange={(evento) => setFechaPersonalizadaHasta(evento.target.value)} />
            <button type="button" className="explorar-aplicar-secundario" onClick={aplicarFechaPersonalizada}>{filtros?.fechas?.aplicar ?? PLACEHOLDER}</button>
          </div>
        </section>

        <div className="explorar-filtro-separador" />

        <section className="explorar-filtro-grupo">
          <label className="cuerpo-p-fuerte" htmlFor={movil ? "explorar-ciudad-movil" : "explorar-ciudad"}>{filtros?.ciudad ?? PLACEHOLDER}</label>
          <select id={movil ? "explorar-ciudad-movil" : "explorar-ciudad"} className="explorar-select" value={ciudadActual} onChange={(evento) => actualizarFiltros({ ciudad: evento.target.value })}>
            <option value="">{filtros?.ciudades?.todas ?? PLACEHOLDER}</option>
            {ciudades.map((ciudad, indice) => {
              const nombre = obtenerNombre(ciudad);
              const valor = typeof ciudad === "string" ? ciudad : ciudad?.nombre || ciudad?.ciudad || ciudad?.slug || ciudad?.id || nombre;
              return <option key={String(valor || indice)} value={valor}>{nombre}</option>;
            })}
          </select>
        </section>

        <div className="explorar-filtro-separador" />

        <section className="explorar-filtro-grupo">
          <h3 className="cuerpo-p-fuerte">{filtros?.precio ?? PLACEHOLDER}</h3>
          <div className="explorar-precio-rangos">
            <input aria-label={filtros?.precioMinimo ?? PLACEHOLDER} type="range" min={PRECIO_MINIMO} max={PRECIO_MAXIMO} step="5000" value={precioTemporalDesde} onChange={(evento) => setPrecioTemporalDesde(Math.min(Number(evento.target.value), precioTemporalHasta - 5000))} />
            <input aria-label={filtros?.precioMaximo ?? PLACEHOLDER} type="range" min={PRECIO_MINIMO} max={PRECIO_MAXIMO} step="5000" value={precioTemporalHasta} onChange={(evento) => setPrecioTemporalHasta(Math.max(Number(evento.target.value), precioTemporalDesde + 5000))} />
          </div>
          <div className="explorar-precio-valores">
            <span>{formatoPrecio(precioTemporalDesde)}</span>
            <span>{formatoPrecio(precioTemporalHasta)}</span>
          </div>
          <button type="button" className="explorar-aplicar-secundario" onClick={aplicarPrecio}>{filtros?.aplicarPrecio ?? PLACEHOLDER}</button>
        </section>

        {movil && (
          <div className="explorar-filtros-acciones-movil">
            <Boton tipo="primario" className="cuerpo-p-fuerte" onClick={() => setFiltrosAbiertos(false)}>
              {botonesFiltros?.verResultados?.replace("{cantidad}", String(totalEventos)) ?? PLACEHOLDER}
            </Boton>
          </div>
        )}
      </div>
    );
  }

  if (cargandoTextos) return <div className="explorar-cargando titular-h3" />;

  return (
    <div className="pagina-explorar">
      <section className="explorar-encabezado">
        <div className="explorar-migas cuerpo-p">
          <Link to={enlaces?.inicio || "/"}>{textos?.navbar?.enlaces?.inicio}</Link>
          <Icono nombre="chevr" />
          <span>{explorar?.seo?.titulo}</span>
        </div>
        <h1 className="titular-h1">{explorar?.seo?.titulo}</h1>
        <p className="cuerpo-m explorar-resumen">{textoResultados?.replace("{cantidad}", totalEventos)}</p>
      </section>

      <section className="explorar-cuerpo">
        <aside className="explorar-filtros-escritorio">{controlesFiltros()}</aside>

        <div className="explorar-resultados">
          <div className="explorar-barra-resultados">
            <form className="explorar-busqueda-resultados" onSubmit={buscar}>
              <Icono nombre="search" />
              <input aria-label={filtros?.buscar ?? PLACEHOLDER} placeholder={filtros?.buscar ?? PLACEHOLDER} value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />
              <button type="submit" aria-label={filtros?.buscar ?? PLACEHOLDER}><Icono nombre="arrowr" /></button>
            </form>
            <button type="button" className="explorar-abrir-filtros" onClick={() => setFiltrosAbiertos(true)} aria-label={filtros?.titulo ?? PLACEHOLDER}>
              <Icono nombre="sliders" />
            </button>
            <label className="explorar-orden">
              <span className="cuerpo-p">{orden?.etiqueta}</span>
              <select className="explorar-select explorar-select-orden" value={ordenActual} onChange={(evento) => actualizarFiltros({ orden: evento.target.value })}>
                <option value="fecha">{opcionesOrden?.fecha}</option>
                <option value="precio">{opcionesOrden?.precio}</option>
                <option value="popularidad">{opcionesOrden?.popularidad}</option>
              </select>
            </label>
          </div>

          {hayFiltrosActivos && (
            <div className="explorar-filtros-activos">
              {categoriasActivas.map((categoria) => {
                const clave = obtenerClaveCategoria(categoria);
                return <button key={clave} type="button" onClick={() => alternarCategoria(clave)}>{obtenerNombre(categoria)} <Icono nombre="x" /></button>;
              })}
              {ciudadActual && <button type="button" onClick={() => actualizarFiltros({ ciudad: "" })}>{ciudadActual} <Icono nombre="x" /></button>}
              {busquedaActual && <button type="button" onClick={() => { actualizarFiltros({ q: "" }); setBusqueda(""); }}>{busquedaActual} <Icono nombre="x" /></button>}
              {(fechaDesde || fechaHasta) && <button type="button" onClick={() => aplicarFecha("")}>{filtros?.fecha ?? PLACEHOLDER} <Icono nombre="x" /></button>}
              {(precioDesde > PRECIO_MINIMO || precioHasta < PRECIO_MAXIMO) && <button type="button" onClick={() => actualizarFiltros({ precioMin: "", precioMax: "" })}>{formatoPrecio(precioDesde)} – {formatoPrecio(precioHasta)} <Icono nombre="x" /></button>}
              <button type="button" className="explorar-limpiar-activos" onClick={() => { actualizarFiltros({}, true); setBusqueda(""); }}>{botonesFiltros?.limpiar ?? PLACEHOLDER}</button>
            </div>
          )}

          {cargando ? (
            <div className="explorar-estado titular-h3" />
          ) : error ? (
            <div className="explorar-estado">
              <p className="cuerpo-m">{explorar?.error?.texto}</p>
              <button type="button" className="explorar-limpiar" onClick={() => setIntento((actual) => actual + 1)}>{explorar?.error?.boton}</button>
            </div>
          ) : eventosVisibles.length === 0 ? (
            <div className="explorar-vacio">
              <h2 className="titular-h3">{vacio?.titulo}</h2>
              <p className="cuerpo-p">{vacio?.texto}</p>
              <button type="button" className="explorar-limpiar" onClick={() => { actualizarFiltros({}, true); setBusqueda(""); }}>{botonesVacio?.limpiar}</button>
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
            <nav className="explorar-paginacion" aria-label={paginacionTextos?.anterior}>
              <button type="button" disabled={paginaActual <= 1} onClick={() => setSearchParams((actuales) => { const siguientes = new URLSearchParams(actuales); siguientes.set("pagina", String(paginaActual - 1)); return siguientes; })} aria-label={paginacionTextos?.anterior}>
                <Icono nombre="chevl" />
              </button>
              {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((pagina) => (
                <button key={pagina} type="button" className={pagina === paginaActual ? "activa" : ""} aria-current={pagina === paginaActual ? "page" : undefined} onClick={() => setSearchParams((actuales) => { const siguientes = new URLSearchParams(actuales); siguientes.set("pagina", String(pagina)); return siguientes; })}>
                  {pagina}
                </button>
              ))}
              <button type="button" disabled={paginaActual >= totalPaginas} onClick={() => setSearchParams((actuales) => { const siguientes = new URLSearchParams(actuales); siguientes.set("pagina", String(paginaActual + 1)); return siguientes; })} aria-label={paginacionTextos?.siguiente}>
                <Icono nombre="chevr" />
              </button>
            </nav>
          )}
        </div>
      </section>

      {filtrosAbiertos && (
        <div className="explorar-panel-capa" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setFiltrosAbiertos(false); }}>
          <section className="explorar-panel" role="dialog" aria-modal="true" aria-label={filtros?.titulo ?? PLACEHOLDER}>
            <div className="explorar-panel-titulo">
              <h2 className="titular-h3">{filtros?.titulo ?? PLACEHOLDER}</h2>
              <button className="explorar-limpiar" type="button" onClick={() => { actualizarFiltros({}, true); setBusqueda(""); }}>{botonesFiltros?.limpiar ?? PLACEHOLDER}</button>
              <button type="button" className="explorar-cerrar-panel" onClick={() => setFiltrosAbiertos(false)} aria-label={filtros?.cerrar ?? PLACEHOLDER}><Icono nombre="x" /></button>
            </div>
            {controlesFiltros(true)}
          </section>
        </div>
      )}
    </div>
  );
}
