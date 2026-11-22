import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useDetalleEvento from "../../hooks/useDetalleEvento";
import Portada from "../../components/Portada/Portada";
import Tarjeta from "../../components/Tarjeta/Tarjeta";
import Icono from "../../components/Icono";
import "./DetalleEvento.css";

function formatoPrecio(valor) {
  const precio = Number(valor);
  if (!Number.isFinite(precio)) return "Consultar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatoFecha(fecha) {
  if (!fecha) return "";
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(valor).replace(".", "");
}

function obtenerFunciones(evento) {
  if (Array.isArray(evento?.funciones)) return evento.funciones;
  if (Array.isArray(evento?.horarios)) return evento.horarios;
  if (Array.isArray(evento?.fechas)) return evento.fechas;
  return [];
}

function obtenerLocalidades(evento) {
  if (Array.isArray(evento?.localidades)) return evento.localidades;
  if (Array.isArray(evento?.entradas)) return evento.entradas;
  return [];
}

function obtenerNombreRecinto(evento) {
  return evento?.recinto?.nombre ?? evento?.lugar?.nombre ?? evento?.recinto ?? evento?.lugar ?? "";
}

function obtenerDireccion(evento) {
  return evento?.recinto?.direccion ?? evento?.lugar?.direccion ?? evento?.direccion ?? "";
}

function PortadaDetalle({ afiche, onVolver, onCompartir }) {
  return (
    <div
      className="detalle-portada"
      style={{
        background: `linear-gradient(164deg, ${afiche?.color1 ?? "#AF7E78"} 0%, ${afiche?.color2 ?? "#603A5A"} 100%)`,
      }}
      aria-label="Afiche del evento"
      role="img"
    >
      <span className="detalle-portada-circulo detalle-portada-circulo-uno" />
      <span className="detalle-portada-circulo detalle-portada-circulo-dos" />
      <div className="detalle-portada-acciones">
        <button type="button" onClick={onVolver} aria-label="Volver"><Icono nombre="chevl" /></button>
        <button type="button" onClick={onCompartir} aria-label="Compartir evento"><Icono nombre="share" /></button>
      </div>
    </div>
  );
}

function EstadoDetalle({ estado, recargar }) {
  if (estado === "cargando") {
    return (
      <div className="detalle-estado" role="status">
        <span className="detalle-spinner" />
        <p className="cuerpo-m">Cargando información del evento...</p>
      </div>
    );
  }

  if (estado === "no-encontrado") {
    return (
      <section className="detalle-estado" role="alert">
        <h1 className="titular-h2">No encontramos este evento</h1>
        <p className="cuerpo-m">Puede que el evento ya no esté disponible o que el enlace sea incorrecto.</p>
        <Link className="detalle-boton detalle-boton-primario" to="/explorar">Explorar eventos</Link>
      </section>
    );
  }

  if (estado === "error") {
    return (
      <section className="detalle-estado" role="alert">
        <h1 className="titular-h2">No pudimos cargar el evento</h1>
        <p className="cuerpo-m">Comprueba tu conexión e inténtalo de nuevo.</p>
        <button className="detalle-boton detalle-boton-primario" type="button" onClick={recargar}>Volver a intentar</button>
      </section>
    );
  }

  return null;
}

export default function DetalleEvento({ textos, en = false }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { evento, relacionados, estado, recargar } = useDetalleEvento(slug);
  const [pestana, setPestana] = useState("descripcion");

  if (estado !== "listo" || !evento) {
    return <EstadoDetalle estado={estado} recargar={recargar} />;
  }

  const titulo = typeof evento?.titulo === "string" ? evento.titulo : "Evento";
  const descripcion = typeof evento?.descripcion === "string" ? evento.descripcion : "";
  const fecha = formatoFecha(evento?.fecha ?? evento?.fechaInicio);
  const hora = evento?.hora ?? evento?.horaInicio ?? evento?.hora_inicio ?? "";
  const recinto = obtenerNombreRecinto(evento);
  const direccion = obtenerDireccion(evento);
  const categoria = typeof evento?.categoria === "string" ? evento.categoria : evento?.categoria?.nombre ?? "";
  const edad = evento?.edadMinima ?? evento?.edad_minima ?? evento?.clasificacion ?? "";
  const funciones = obtenerFunciones(evento);
  const localidades = obtenerLocalidades(evento);
  const desde = evento?.precioDesde ?? evento?.precio_desde ?? evento?.precio;
  const politicas = typeof evento?.politicas === "string" ? evento.politicas : typeof evento?.condiciones === "string" ? evento.condiciones : "Consulta las condiciones de ingreso y las políticas del evento con el organizador.";

  async function compartirEvento() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: descripcion, url });
      } catch (error) {
        if (error?.name !== "AbortError") console.error("No se pudo compartir el evento:", error);
      }
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="pagina-detalle-evento">
      <title>{titulo} | Taquilla</title>
      <meta name="description" content={String(descripcion).slice(0, 160)} />

      <section className="detalle-portada-seccion">
        <nav className="detalle-migas cuerpo-p" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <Icono nombre="chevr" />
          <Link to="/explorar">Explorar</Link>
          <Icono nombre="chevr" />
          <span aria-current="page">{titulo}</span>
        </nav>
        <div className="detalle-portada-contenedor">
          <PortadaDetalle afiche={evento?.afiche} onVolver={() => navigate(-1)} onCompartir={compartirEvento} />
        </div>
      </section>

      <section className="detalle-contenido">
        <div className="detalle-informacion">
          <div className="detalle-cabecera">
            <div className="detalle-etiquetas">
              {categoria && <span className="detalle-etiqueta">{categoria}</span>}
              {edad && <span className="detalle-etiqueta detalle-etiqueta-secundaria">{typeof edad === "number" ? `Mayores de ${edad}` : edad}</span>}
            </div>
            <h1 className="titular-display detalle-titulo">{titulo}</h1>
            {evento?.artista && <p className="cuerpo-g detalle-artista">{evento.artista}</p>}
            <div className="detalle-datos">
              {fecha && (
                <div className="detalle-dato">
                  <span className="detalle-dato-icono"><Icono nombre="calendar" /></span>
                  <span><small>Fecha</small><strong>{fecha}</strong></span>
                </div>
              )}
              {hora && (
                <div className="detalle-dato">
                  <span className="detalle-dato-icono"><Icono nombre="clock" /></span>
                  <span><small>Hora</small><strong>{hora}</strong></span>
                </div>
              )}
              {recinto && (
                <div className="detalle-dato">
                  <span className="detalle-dato-icono"><Icono nombre="pin" /></span>
                  <span><small>Lugar</small><strong>{recinto}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="detalle-pestanas" role="tablist" aria-label="Información del evento">
            <button type="button" role="tab" aria-selected={pestana === "descripcion"} className={pestana === "descripcion" ? "activa" : ""} onClick={() => setPestana("descripcion")}>Descripción</button>
            <button type="button" role="tab" aria-selected={pestana === "llegar"} className={pestana === "llegar" ? "activa" : ""} onClick={() => setPestana("llegar")}>Cómo llegar</button>
            <button type="button" role="tab" aria-selected={pestana === "politicas"} className={pestana === "politicas" ? "activa" : ""} onClick={() => setPestana("politicas")}>Políticas</button>
          </div>

          {pestana === "descripcion" && (
            <div className="detalle-seccion-texto" role="tabpanel">
              <h2 className="titular-h2">Sobre el evento</h2>
              {descripcion ? <p className="cuerpo-m">{descripcion}</p> : <p className="cuerpo-m">Consulta los detalles de este evento.</p>}
              {funciones.length > 0 && (
                <div className="detalle-subseccion">
                  <h3 className="titular-h3">Funciones</h3>
                  <div className="detalle-lista-funciones">
                    {funciones.map((funcion, indice) => {
                      const fechaFuncion = formatoFecha(funcion?.fecha ?? funcion?.fechaInicio ?? funcion?.inicio);
                      const horaFuncion = funcion?.hora ?? funcion?.horaInicio ?? funcion?.hora_inicio ?? "";
                      return (
                        <div className="detalle-funcion" key={funcion?.id ?? funcion?.slug ?? indice}>
                          <span className="detalle-dato-icono"><Icono nombre="calendar" /></span>
                          <span><strong>{fechaFuncion || funcion?.nombre || `Función ${indice + 1}`}</strong>{horaFuncion && <small>{horaFuncion}</small>}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="detalle-subseccion">
                <h3 className="titular-h3">Localidades y entradas</h3>
                {localidades.length > 0 ? (
                  <div className="detalle-localidades" id="localidades">
                    {localidades.map((localidad, indice) => {
                      const precio = localidad?.precio ?? localidad?.valor ?? localidad?.precioDesde ?? localidad?.precio_desde;
                      const disponibles = localidad?.disponibilidad ?? localidad?.disponibles ?? localidad?.cantidadDisponible ?? localidad?.cantidad_disponible;
                      const agotada = localidad?.agotada === true || localidad?.disponible === false || (disponibles != null && Number.isFinite(Number(disponibles)) && Number(disponibles) <= 0);
                      return (
                        <article className="detalle-localidad" key={localidad?.id ?? localidad?.nombre ?? indice}>
                          <div>
                            <h4 className="cuerpo-p-fuerte">{localidad?.nombre ?? localidad?.tipo ?? `Localidad ${indice + 1}`}</h4>
                            <p className="detalle-nota">{agotada ? "Agotada" : disponibles != null ? `${disponibles} disponibles` : "Disponibilidad por confirmar"}</p>
                          </div>
                          <strong>{formatoPrecio(precio)}</strong>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="cuerpo-p detalle-sin-datos">La información de localidades estará disponible próximamente.</p>
                )}
              </div>
              {desde != null && (
                <p className="detalle-desde cuerpo-p">Entradas desde <strong>{formatoPrecio(desde)}</strong></p>
              )}
            </div>
          )}

          {pestana === "llegar" && (
            <div className="detalle-seccion-texto" role="tabpanel">
              <h2 className="titular-h2">Cómo llegar</h2>
              <div className="detalle-mapa">
                <Icono nombre="pin" />
                <strong>{recinto || "Ubicación del evento"}</strong>
                <span>{direccion || "Consulta la dirección con el organizador."}</span>
                {direccion && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`} target="_blank" rel="noreferrer">Ver indicaciones</a>}
              </div>
            </div>
          )}

          {pestana === "politicas" && (
            <div className="detalle-seccion-texto" role="tabpanel">
              <h2 className="titular-h2">Políticas</h2>
              <p className="cuerpo-m">{politicas}</p>
            </div>
          )}
        </div>

      </section>

      <section className="detalle-relacionados">
        <div className="detalle-relacionados-cabecera">
          <h2 className="titular-h2">También te puede interesar</h2>
        </div>
        {relacionados.length > 0 ? (
          <div className="detalle-relacionados-grid">
            {relacionados.slice(0, 4).map((relacionado, indice) => (
              <Tarjeta key={relacionado?.id ?? relacionado?.slug ?? indice} textos={textos} evento={relacionado} en={en} />
            ))}
          </div>
        ) : (
          <p className="cuerpo-p detalle-sin-datos">No hay eventos relacionados por el momento.</p>
        )}
      </section>
    </div>
  );
}
