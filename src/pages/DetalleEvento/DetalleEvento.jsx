import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useDetalleEvento from "../../hooks/useDetalleEvento";
import Tarjeta from "../../components/Tarjeta/Tarjeta";
import Icono from "../../components/Icono";
import "./DetalleEvento.css";

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

function obtenerHoraEvento(evento) {
  const horaExplicita = evento?.hora ?? evento?.horaInicio ?? evento?.hora_inicio ?? evento?.hora_inicio_evento;
  if (horaExplicita) return horaExplicita;

  const fechaCompleta = evento?.fecha ?? evento?.fechaInicio ?? evento?.fecha_inicio ?? evento?.fechaHora ?? evento?.fecha_hora ?? evento?.inicio;
  if (!fechaCompleta || typeof fechaCompleta !== "string") return "";

  // Si la fecha viene con hora desde la API, la mostramos aunque no exista un campo "hora".
  if (!/[T ]\d{1,2}:\d{2}/.test(fechaCompleta)) return "";

  const valor = new Date(fechaCompleta);
  if (Number.isNaN(valor.getTime())) return "";

  return new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(valor);
}

function obtenerNombreRecinto(evento) {
  const recinto = evento?.recinto ?? evento?.lugar;
  if (typeof recinto === "string") return recinto;
  return recinto?.nombre ?? "";
}

function obtenerDireccion(evento) {
  const direccion = evento?.recinto?.direccion ?? evento?.lugar?.direccion ?? evento?.direccion;
  return typeof direccion === "string" ? direccion : "";
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
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);

  if (estado !== "listo" || !evento) {
    return (
      <div className={`pagina-detalle-evento ${descripcionExpandida ? "detalle-expandido" : ""}`}>
        <EstadoDetalle estado={estado} recargar={recargar} />
      </div>
    );
  }

  const titulo = typeof evento?.titulo === "string" ? evento.titulo : "Evento";
  const descripcion = typeof evento?.descripcion === "string" ? evento.descripcion : "";
  const fechaCompleta = evento?.fecha ?? evento?.fechaInicio ?? evento?.fecha_inicio ?? evento?.fechaHora ?? evento?.fecha_hora ?? evento?.inicio;
  const fecha = formatoFecha(fechaCompleta);
  const hora = obtenerHoraEvento(evento);
  const recinto = obtenerNombreRecinto(evento);
  const direccion = obtenerDireccion(evento);
  const categoria = typeof evento?.categoria === "string" ? evento.categoria : evento?.categoria?.nombre ?? "";
  const edadValor = evento?.edadMinima ?? evento?.edad_minima ?? evento?.clasificacion ?? "";
  const edad = typeof edadValor === "string" || typeof edadValor === "number" ? edadValor : "";
  const politicas = typeof evento?.politicas === "string" ? evento.politicas : typeof evento?.condiciones === "string" ? evento.condiciones : "";
  const hayMasInformacion = descripcion.length > 140;

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
    <div className={`pagina-detalle-evento ${descripcionExpandida ? "detalle-expandido" : ""}`}>
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
            {typeof evento?.artista === "string" && <p className="cuerpo-g detalle-artista">{evento.artista}</p>}
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

          <nav className="detalle-pestanas" aria-label="Información del evento">
            <a className="activa" href="#descripcion">Descripción</a>
            <a href="#llegar">Cómo llegar</a>
            <a href="#politicas">Políticas</a>
          </nav>

          <section className="detalle-seccion-texto detalle-seccion-descripcion" id="descripcion">
            <h2 className="titular-h2">Sobre el evento</h2>
            <p className={`cuerpo-m detalle-descripcion ${descripcionExpandida ? "expandida" : ""}`}>
              {descripcion || "Consulta los detalles de este evento."}
            </p>
            {hayMasInformacion && (
              <button className="detalle-leer-mas" type="button" onClick={() => setDescripcionExpandida((actual) => !actual)} aria-expanded={descripcionExpandida}>
                {descripcionExpandida ? "Leer menos" : "Leer más"}
              </button>
            )}


          </section>

          <section className="detalle-seccion-texto detalle-seccion-llegar" id="llegar">
            <h2 className="titular-h2">Cómo llegar</h2>
            <div className="detalle-mapa">
              <Icono nombre="pin" />
              <span>Mapa del lugar</span>
            </div>
            <p className="detalle-direccion">{[recinto, direccion].filter(Boolean).join(" · ") || "Consulta la ubicación con el organizador."}</p>
          </section>

          <section className="detalle-seccion-texto detalle-seccion-politicas" id="politicas">
            <h2 className="titular-h2">Políticas</h2>
            <p className="cuerpo-m">
              {politicas || "Consulta las políticas y condiciones de ingreso establecidas por el organizador del evento."}
            </p>
          </section>
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
