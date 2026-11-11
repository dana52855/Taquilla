import './BotonIcono.css'
import Icono from '../Icono'

const BotonIcono = ({ ancho, tipo, href, onClick, icono, ariaLabel }) => {
    if (href) {
        return (
            <Link to={href} className={`boton-icono ${tipo}`} style={{ width: ancho }} onClick={onClick} aria-label={ariaLabel}>
                {children}
            </Link>
        );
    }

    return (
        <button className={`boton-icono ${tipo}`} style={{ width: ancho }} onClick={onClick}>
            <Icono nombre={icono} />
        </button>
    )
}

export default BotonIcono