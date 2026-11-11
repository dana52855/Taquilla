import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useEventos from "../../hooks/useEventos";
import useCategorias from "../../hooks/useCategorias";
import Tarjeta from "../../components/Tarjeta/Tarjeta";
import Portada from "../../components/Portada/Portada";
import Etiqueta from "../../components/Etiqueta/Etiqueta";
import Boton from "../../components/Boton/Boton";
import Icono from "../../components/Icono";
import "./Home.css";

const PLACEHOLDER = "PLACEHOLDER";

const iconosCategorias = {
  conciertos: "music",
  teatro: "star",
  deportes: "trophy",
  festivales: "flag",
  comedia: "smile",
  familiares: "user",
};

function Home({ textos, cargando: cargandoTextos, en, enlaces }) {
  const inicio = textos?.paginas?.inicio;
  const hero = inicio?.hero;
  const destacados = inicio?.destacados;
  const proximos = inicio?.proximos;
  const textosCategorias = inicio?.categorias;

  const [consulta, setConsulta] = useState("");
  const [ciudad, setCiudad] = useState("Manizales");
  const [fecha, setFecha] = useState("");

  const {
    eventos: eventosDestacados,
    cargando: cargandoDestacados,
    error: errorDestacados,
  } = useEventos(true);

  const {
    categorias,
    cargando: cargandoCategorias,
    error: errorCargando,
  } = useCategorias(true);

  const {
    eventos: todosLosEventos,
    cargando: cargandoEventos,
    error: errorEventos,
  } = useEventos();

  const eventoPrincipal = eventosDestacados?.[0];

  function buscarEventos(evento) {
    evento.preventDefault();
    const parametros = new URLSearchParams();
    if (consulta.trim()) parametros.set("buscar", consulta.trim());
    if (ciudad.trim()) parametros.set("ciudad", ciudad.trim());
    if (fecha) parametros.set("fecha", fecha);
    const sufijo = parametros.toString();
    window.location.href = sufijo
      ? `${enlaces.eventos}?${sufijo}`
      : enlaces.eventos;
  }

  return (
    <div className="inicio-publico">
      {cargandoTextos ? (
        <div className="titular-h3 cargando">
          {en ? "LOADING HOME..." : "CARGANDO INICIO..."}
        </div>
      ) : (
        <>
          <section className="home-hero">
            <div className="home-hero-interior">
              <div className="home-hero-mensaje">
                <Etiqueta tono="marca">{hero?.etiquetas?.temporada}</Etiqueta>

                <h1 className="titular-display home-hero-titulo">
                  {hero?.titulo}
                </h1>

                <p className="cuerpo-m home-hero-descripcion">
                  {hero?.subtitulo}
                </p>

                <form className="home-buscador" onSubmit={buscarEventos}>
                  <label className="home-buscador-campo">
                    <Icono nombre="search" />
                    <span>
                      <span className="detalle-nota-fuerte home-buscador-etiqueta">
                        {hero?.buscador?.etiquetas?.que}
                      </span>
                      <input
                        className="cuerpo-p-fuerte"
                        value={consulta}
                        onChange={(evento) => setConsulta(evento.target.value)}
                        placeholder={hero?.buscador?.placeholders?.que}
                      />
                      <span className="home-buscador-resumen" hidden>
                        {ciudad} · {hero?.buscador?.placeholders?.cuando}
                      </span>
                    </span>
                  </label>

                  <span className="home-buscador-divisor" />

                  <label className="home-buscador-campo">
                    <Icono nombre="pin" />
                    <span>
                      <span className="detalle-nota-fuerte home-buscador-etiqueta">
                        {hero?.buscador?.etiquetas?.donde}
                      </span>
                      <input
                        className="cuerpo-p-fuerte"
                        value={ciudad}
                        onChange={(evento) => setCiudad(evento.target.value)}
                      />
                    </span>
                  </label>

                  <span className="home-buscador-divisor" />

                  <label className="home-buscador-campo">
                    <Icono nombre="calendar" />
                    <span>
                      <span className="detalle-nota-fuerte home-buscador-etiqueta">
                        {hero?.buscador?.etiquetas?.cuando}
                      </span>
                      <input
                        className="cuerpo-p-fuerte"
                        value={fecha}
                        onChange={(evento) => setFecha(evento.target.value)}
                        placeholder={hero?.buscador?.placeholders?.cuando}
                      />
                    </span>
                  </label>

                  <Boton className="cuerpo-p-fuerte home-buscador-filtros" tipo="primario">
                    <span>{hero?.buscador?.botones?.buscar}</span>
                    <Icono nombre="sliders" className='boton-buscar-mobile' />
                  </Boton>
                </form>
              </div>

              <article className="home-evento-principal">
                <Portada tamano="g" {...eventoPrincipal?.afiche} />
                <div className="home-evento-ficha">
                  <Etiqueta tono="marca">{hero?.destacado?.etiqueta}</Etiqueta>
                  <h2 className="titular-h2">{eventoPrincipal?.titulo}</h2>
                  <div className="home-evento-pie">
                    <div>
                      <p className="cuerpo-p">
                        {eventoPrincipal?.fecha}
                        {eventoPrincipal?.recinto?.nombre
                          ? ` · ${eventoPrincipal.recinto.nombre}`
                          : ""}
                      </p>
                      <p className="cuerpo-m-fuerte">
                        {hero?.destacado?.desde?.replace(
                          "{precio}",
                          `$${eventoPrincipal?.precioDesde}`,
                        )}
                      </p>
                    </div>
                    <div>
                    <Boton
                      className="cuerpo-p-fuerte"
                      tipo="primario"
                      href={`${enlaces.eventos}?slug=${eventoPrincipal?.slug}`}
                    >
                      {hero?.destacado?.botones?.verEvento}
                    </Boton>
                    </div>

                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="home-categorias">
            <Link
              to={enlaces.eventos}
              className="home-categoria home-categoria-todos"
            >
              {inicio?.filtrosMovil?.todos}
            </Link>
            {categorias?.map((categoria) => (
              <Link
                to={`${enlaces.eventos}?categoria=${categoria?.id}`}
                className="home-categoria"
                type="button"
                key={categoria?.id}
              >
                <span className="home-categoria-icono">
                  <Icono nombre={iconosCategorias[categoria?.id]} />
                </span>
                <span className="home-categoria-textos">
                  <span className="cuerpo-p-fuerte">{categoria?.nombre}</span>
                  <span className="detalle-nota">
                    {categoria?.eventos === 1
                      ? textosCategorias?.eventos?.uno?.replace(
                          "{cantidad}",
                          categoria?.eventos,
                        )
                      : textosCategorias?.eventos?.otro?.replace(
                          "{cantidad}",
                          categoria?.eventos,
                        )}
                  </span>
                </span>
              </Link>
            ))}
          </section>

          <section className="home-destacados">
            <div className="home-seccion-cabecera">
              <div>
                <h2 className="titular-h2">{destacados?.titulo}</h2>
                <p className="cuerpo-m">{destacados?.subtitulo}</p>
              </div>
              <Link
                className="home-ver-todos cuerpo-p-fuerte"
                to={enlaces.eventos}
              >
                {destacados?.enlaces?.verTodos}
                <Icono nombre="arrowr" />
              </Link>
            </div>

            {cargandoDestacados ? (
              <div className="titular-h3 cargando">
                {en ? "Loading events..." : "Cargando eventos..."}
              </div>
            ) : errorDestacados ? (
              <div className="home-eventos-error">
                <p className="cuerpo-p">
                  {en ? "Error on loading events..." : "Error al cargar eventos..."}
                </p>
              </div>
            ) : (
              <div className="home-eventos-grid">
                {eventosDestacados?.slice(0,4)?.map((evento) => (
                  <Tarjeta
                    key={evento?.id}
                    textos={textos}
                    evento={evento}
                    en={en}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="home-destacados">
            <div className="home-seccion-cabecera">
              <div>
                <h2 className="titular-h2">
                  {proximos?.titulo?.replace("{ciudad}", ciudad)}
                </h2>
                <p className="cuerpo-m">{proximos?.subtitulo}</p>
              </div>
              <Link
                className="home-ver-todos cuerpo-p-fuerte"
                to={enlaces.eventos}
              >
                {destacados?.enlaces?.verTodos}
                <Icono className="flecha" nombre="arrowr" />
              </Link>
            </div>

            {cargandoEventos ? (
              <div className="titular-h3 cargando">
                {en ? "Loading events..." : "Cargando eventos..."}
              </div>
            ) : errorEventos ? (
              <div className="home-eventos-error">
                <p className="cuerpo-p">
                  {en ? "Error on loading events..." : "Error al cargar eventos..."}
                </p>
              </div>
            ) : (
              <div className="home-eventos-grid">
                {todosLosEventos?.slice(0,4)?.map((evento) => (
                  <Tarjeta
                    key={evento?.id}
                    textos={textos}
                    evento={evento}
                    en={en}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
