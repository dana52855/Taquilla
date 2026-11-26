import "./Tarjeta.css";
import Portada from "../Portada/Portada";
import Etiqueta from "../Etiqueta/Etiqueta";
import { Link } from "react-router-dom";
import "../Boton/Boton.css";
import Icono from "../Icono";

const formatearFecha = (fecha, en) => {
  if (!fecha) return "";

  const fechaEvento = new Date(fecha);
  if (Number.isNaN(fechaEvento.getTime())) return fecha;

  const idioma = en ? "en-US" : "es-CO";
  const diaSemana = new Intl.DateTimeFormat(idioma, {
    weekday: "short",
  }).format(fechaEvento);
  const diaMes = new Intl.DateTimeFormat(idioma, {
    day: "numeric",
  }).format(fechaEvento);
  const mes = new Intl.DateTimeFormat(idioma, {
    month: "short",
  }).format(fechaEvento);
  const hora = new Intl.DateTimeFormat(idioma, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(fechaEvento);

  if (en) {
    return `${diaSemana} ${mes} ${diaMes} · ${hora}`;
  }

  const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
  return `${diaCapitalizado} ${diaMes} ${mes} · ${hora}`;
};

const Tarjeta = ({ textos, evento, en = false }) => {
  const tarjeta = textos?.paginas?.inicio?.tarjeta;
  const claveCategoria = evento?.categoria?.id ?? evento?.categoria?.slug ?? (typeof evento?.categoria === "string" ? evento.categoria : undefined);
  const categoria = textos?.general?.categorias?.singular?.[claveCategoria] ?? evento?.categoria?.nombre ?? claveCategoria;
  const slug = evento?.slug;

  return (
    <Link className="tarjeta-evento" to={slug ? `/eventos/${encodeURIComponent(slug)}` : "/explorar"}>
      <div className="portada-evento">
        <Portada {...evento?.afiche} tamano="p" />
      </div>
      <div className="texto-evento">
        <Etiqueta tono="marca">{categoria}</Etiqueta>
        <div className="titular-h3">{evento?.titulo}</div>
        <div className="cuerpo-p info-evento">
          <Icono nombre="calendar" />
          <div>{formatearFecha(evento?.fecha, en)}</div>
        </div>
        <div className="cuerpo-p info-evento">
          <Icono nombre="pin" />
          <div>{evento?.recinto?.nombre ?? (typeof evento?.recinto === "string" ? evento.recinto : "")}</div>
        </div>
        <div className="botones-evento">
          <div>
            <div className="detalle-nota">
              {tarjeta?.desde}
            </div>
            <div className="cuerpo-m-fuerte">{evento?.precioDesde != null ? new Intl.NumberFormat(en ? "en-US" : "es-CO", { style: "currency", currency: "COP", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(evento.precioDesde) : ""}</div>
          </div>
          <div>
            <span className="boton cuerpo-p-fuerte secundario tarjeta-ver-evento">
              {tarjeta?.botones?.verEvento}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Tarjeta;
