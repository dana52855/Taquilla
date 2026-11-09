import "./Tarjeta.css";
import Portada from "../Portada/Portada";
import Etiqueta from "../Etiqueta/Etiqueta";
import Boton from "../Boton/Boton";
import Icono from "../Icono"

const tipos = {
    conciertos:'Concierto',
    deportes:'Deporte',
    festivales:'Festival',
    teatro:'Teatro',
    familiares:'Familia'
}

const Tarjeta = ({ textos, evento }) => {
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
            <Icono nombre='calendar'/>
            <div>{evento?.fecha}</div>
        </div>
        <div className="cuerpo-p info-evento">
            <Icono nombre='pin'/>
            <div>{evento?.recinto?.nombre}</div>
        </div>
        <div className="botones-evento">
            <div>
                <div className="detalle-nota">{destacado?.desde?.replace('{precio}','')}</div>
                <div className="cuerpo-m-fuerte">{`$${evento?.precioDesde}`}</div>
            </div>
            <Boton className='cuerpo-p-fuerte' tipo='secundario'>{destacado?.botones?.verEvento}</Boton>
        </div>
      </div>
    </span>
  );
};

export default Tarjeta;
