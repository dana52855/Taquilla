import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useEventos from "../../hooks/useEventos";
import Tarjeta from "../../components/Tarjeta/Tarjeta";
import Portada from "../../components/Portada/Portada";
import Etiqueta from "../../components/Etiqueta/Etiqueta";
import Boton from "../../components/Boton/Boton";
import Icono from "../../components/Icono";
import "./Home.css";

const CATEGORIAS = [
  { clave: "conciertos", icono: "music" },
  { clave: "teatro", icono: "star" },
  { clave: "deportes", icono: "trophy" },
  { clave: "festivales", icono: "flag" },
  { clave: "comedia", icono: "smile" },
  { clave: "familiares", icono: "users" },
];

const PLACEHOLDER = "PLACEHOLDER";

function leerTexto(objeto, rutas, alternativo = PLACEHOLDER) {
  for (const ruta of rutas) {
    const valor = ruta.split(".").reduce((actual, clave) => actual?.[clave], objeto);
    if (typeof valor === "string" && valor.trim()) return valor;
  }
  return alternativo;
}

function normalizarCategoria(categoria) {
  return String(categoria || "").toLowerCase();
}

function Home({ datos, en, enlaces }) {
  const { textos, cargando: cargandoTextos } = datos;
  const inicio = textos?.paginas?.inicio || {};
  const hero = inicio.hero || {};
  const seccionDestacados = inicio.destacados || inicio.destacadosSemana || {};
  const textosCategorias = inicio.categorias || textos?.categorias || {};

  const [consulta, setConsulta] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [fecha, setFecha] = useState("");

  const {
    eventos: eventosDestacados,
    cargando: cargandoDestacados,
    error: errorDestacados,
    recargar: recargarDestacados,
  } = useEventos(true);

  const {
    eventos: todosLosEventos,
    cargando: cargandoEventos,
  } = useEventos();

  const listaDestacados = Array.isArray(eventosDestacados) ? eventosDestacados : [];
  const listaEventos = Array.isArray(todosLosEventos) ? todosLosEventos : [];
  const eventoPrincipal = listaDestacados[0] || listaEventos[0];

  const cantidadPorCategoria = useMemo(() => {
    return CATEGORIAS.reduce((resultado, categoria) => {
      resultado[categoria.clave] = listaEventos.filter(
        (evento) => normalizarCategoria(evento?.categoria) === categoria.clave
      ).length;
      return resultado;
    }, {});
  }, [listaEventos]);

  const populares = Array.isArray(hero?.populares?.items)
    ? hero.populares.items
    : Array.isArray(hero?.populares)
      ? hero.populares
      : [];

  function buscarEventos(evento) {
    evento.preventDefault();
    const parametros = new URLSearchParams();
    if (consulta.trim()) parametros.set("buscar", consulta.trim());
    if (ciudad.trim()) parametros.set("ciudad", ciudad.trim());
    if (fecha) parametros.set("fecha", fecha);
    const sufijo = parametros.toString();
    window.location.href = sufijo
      ? `${enlaces.explorar}?${sufijo}`
      : enlaces.explorar;
  }

  function seleccionarCategoria(categoria) {
    const parametros = new URLSearchParams({ categoria });
    window.location.href = `${enlaces.explorar}?${parametros.toString()}`;
  }

  const textosTarjeta = {
    ...textos,
    paginas: {
      ...textos?.paginas,
      inicio: {
        ...inicio,
        hero: {
          ...hero,
          destacado: {
            ...hero?.destacado,
            desde: leerTexto(hero?.destacado || {}, ["desde"], PLACEHOLDER),
            botones: {
              ...hero?.destacado?.botones,
              verEvento: leerTexto(hero?.destacado || {}, ["botones.verEvento"], PLACEHOLDER),
            },
          },
        },
      },
    },
  };

  return (
    <div className="inicio-publico">
      {cargandoTextos ? (
        <div className="titular-h3 cargando">{en ? "LOADING HOME..." : "CARGANDO INICIO..."}</div>
      ) : (
        <>
          <section className="home-hero">
            <div className="home-hero-interior">
              <div className="home-hero-mensaje">
                <Etiqueta tono="marca">
                  {leerTexto(hero, ["temporada", "etiqueta", "subtitulo"])}
                </Etiqueta>

                <h1 className="titular-display home-hero-titulo">
                  {leerTexto(hero, ["titulo", "tituloPrincipal", "encabezado"])}
                </h1>

                <p className="cuerpo-m home-hero-descripcion">
                  {leerTexto(hero, ["descripcion", "texto", "bajada"])}
                </p>

                <form className="home-buscador" onSubmit={buscarEventos}>
                  <label className="home-buscador-campo">
                    <Icono nombre="search" />
                    <span>
                      <span className="detalle-nota home-buscador-etiqueta">
                        {leerTexto(hero?.buscador || {}, ["que.titulo", "que.etiqueta", "etiquetaQue"])}
                      </span>
                      <input
                        className="cuerpo-p"
                        value={consulta}
                        onChange={(evento) => setConsulta(evento.target.value)}
                        placeholder={leerTexto(hero?.buscador || {}, ["que.placeholder", "placeholder"])}
                      />
                    </span>
                  </label>

                  <span className="home-buscador-divisor" />

                  <label className="home-buscador-campo">
                    <Icono nombre="pin" />
                    <span>
                      <span className="detalle-nota home-buscador-etiqueta">
                        {leerTexto(hero?.buscador || {}, ["donde.titulo", "donde.etiqueta"])}
                      </span>
                      <input
                        className="cuerpo-p"
                        value={ciudad}
                        onChange={(evento) => setCiudad(evento.target.value)}
                        placeholder={leerTexto(hero?.buscador || {}, ["donde.placeholder", "ciudad.placeholder"])}
                      />
                    </span>
                  </label>

                  <span className="home-buscador-divisor" />

                  <label className="home-buscador-campo">
                    <Icono nombre="calendar" />
                    <span>
                      <span className="detalle-nota home-buscador-etiqueta">
                        {leerTexto(hero?.buscador || {}, ["cuando.titulo", "cuando.etiqueta"])}
                      </span>
                      <input
                        className="cuerpo-p"
                        type="date"
                        value={fecha}
                        onChange={(evento) => setFecha(evento.target.value)}
                        aria-label={leerTexto(hero?.buscador || {}, ["cuando.aria", "cuando.titulo"])}
                      />
                    </span>
                  </label>

                  <Boton className="cuerpo-p-fuerte" tipo="primario">
                    {leerTexto(hero?.buscador || {}, ["boton", "buscar"])}
                  </Boton>
                </form>

                {populares.length > 0 && (
                  <div className="home-populares">
                    <span>{leerTexto(hero?.populares || {}, ["titulo", "etiqueta"])}</span>
                    {populares.map((popular, indice) => {
                      const valor = typeof popular === "string" ? popular : popular?.texto || popular?.nombre;
                      if (!valor) return null;
                      return (
                        <button
                          type="button"
                          key={valor + indice}
                          onClick={() => setConsulta(valor)}
                        >
                          {valor}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <article className="home-evento-principal">
                <Portada tamano="g" {...eventoPrincipal?.afiche} />
                <div className="home-evento-ficha">
                  <Etiqueta tono="marca">
                    {leerTexto(hero?.destacado || {}, ["etiqueta"], PLACEHOLDER)}
                  </Etiqueta>
                  <h2 className="titular-h2">
                    {eventoPrincipal?.titulo || PLACEHOLDER}
                  </h2>
                  <div className="home-evento-pie">
                    <div>
                      <p className="cuerpo-p">
                        {eventoPrincipal?.fecha || PLACEHOLDER}
                        {eventoPrincipal?.recinto?.nombre ? ` · ${eventoPrincipal.recinto.nombre}` : ""}
                      </p>
                      <p className="cuerpo-m-fuerte">
                        {leerTexto(hero?.destacado || {}, ["desde"], PLACEHOLDER)}
                        {eventoPrincipal?.precioDesde != null
                          ? ` $${Number(eventoPrincipal.precioDesde).toLocaleString("es-CO")}`
                          : ""}
                      </p>
                    </div>
                    <Boton className="cuerpo-p-fuerte" tipo="primario" href={enlaces.explorar}>
                      {leerTexto(hero?.destacado || {}, ["botones.verEvento"], PLACEHOLDER)}
                    </Boton>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="home-categorias" aria-label={leerTexto(inicio, ["categorias.titulo", "tituloCategorias"])}>
            {CATEGORIAS.map((categoria) => (
              <button
                className="home-categoria"
                type="button"
                key={categoria.clave}
                onClick={() => seleccionarCategoria(categoria.clave)}
              >
                <span className="home-categoria-icono">
                  <Icono nombre={categoria.icono} />
                </span>
                <span className="home-categoria-textos">
                  <span className="cuerpo-p-fuerte">
                    {leerTexto(textosCategorias, [categoria.clave, `${categoria.clave}.titulo`])}
                  </span>
                  <span className="detalle-nota">
                    {cantidadPorCategoria[categoria.clave]} {leerTexto(inicio, ["categorias.eventos", "categorias.sufijo"], PLACEHOLDER)}
                  </span>
                </span>
              </button>
            ))}
          </section>

          <section className="home-destacados">
            <div className="home-seccion-cabecera">
              <div>
                <h2 className="titular-h2">
                  {leerTexto(seccionDestacados, ["titulo", "encabezado"])}
                </h2>
                <p className="cuerpo-m">
                  {leerTexto(seccionDestacados, ["descripcion", "subtitulo", "texto"])}
                </p>
              </div>
              <Link className="home-ver-todos cuerpo-p-fuerte" to={enlaces.explorar}>
                {leerTexto(seccionDestacados, ["verTodos", "boton", "enlace"])}
              </Link>
            </div>

            {cargandoDestacados || cargandoEventos ? (
              <div className="titular-h3 cargando">
                {en ? "LOADING EVENTS..." : "CARGANDO EVENTOS..."}
              </div>
            ) : errorDestacados ? (
              <div className="home-eventos-error">
                <p className="cuerpo-p">{leerTexto(seccionDestacados, ["error"], PLACEHOLDER)}</p>
                <Boton className="cuerpo-p-fuerte" tipo="secundario" onClick={recargarDestacados}>
                  {leerTexto(seccionDestacados, ["reintentar"], PLACEHOLDER)}
                </Boton>
              </div>
            ) : listaDestacados.length > 0 ? (
              <div className="home-eventos-grid">
                {listaDestacados.slice(0, 4).map((evento) => (
                  <Tarjeta
                    key={evento?.id || evento?.slug || evento?.titulo}
                    textos={textosTarjeta}
                    evento={evento}
                  />
                ))}
              </div>
            ) : (
              <p className="cuerpo-p">{leerTexto(seccionDestacados, ["sinEventos", "vacio"], PLACEHOLDER)}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
