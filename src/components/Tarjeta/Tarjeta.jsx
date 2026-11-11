import "./Tarjeta.css";
import Portada from "../Portada/Portada";
import Etiqueta from "../Etiqueta/Etiqueta";
import Boton from "../Boton/Boton";
import Icono from "../Icono";

const tipos = {
  conciertos: "Concierto",
  deportes: "Deporte",
  festivales: "Festival",
  teatro: "Teatro",
  familiares: "Familia",
};

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
  const destacado = textos?.paginas?.inicio?.hero?.destacado;
  return (
    <span className="tarjeta-evento">
      <div className="portada-evento">
        <Portada {...evento?.afiche} tamano="p" />
      </div>
      <div className="texto-evento">
        <Etiqueta tono="marca">{tipos[evento?.categoria]}</Etiqueta>
        <div className="titular-h3">{evento?.titulo}</div>
        <div className="cuerpo-p info-evento">
          <Icono nombre="calendar" />
          <div>{formatearFecha(evento?.fecha, en)}</div>
        </div>
        <div className="cuerpo-p info-evento">
          <Icono nombre="pin" />
          <div>{evento?.recinto?.nombre}</div>
        </div>
        <div className="botones-evento">
          <div>
            <div className="detalle-nota">
              {destacado?.desde?.replace("{precio}", "")}
            </div>
            <div className="cuerpo-m-fuerte">{`$${evento?.precioDesde}`}</div>
          </div>
          <div>
            <Boton className="cuerpo-p-fuerte" tipo="secundario" href={`/eventos?slug=${evento?.slug}`}>
              {destacado?.botones?.verEvento}
            </Boton>
          </div>
        </div>
      </div>
    </span>
  );
};

export default Tarjeta;
