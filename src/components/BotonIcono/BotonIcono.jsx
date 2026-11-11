import './BotonIcono.css'
import Icono from '../Icono'
import { Link } from 'react-router-dom'

const BotonIcono = ({ ancho, tipo, href, onClick, icono, ariaLabel, children }) => {
    if (href) {
        return (
            <Link to={href} className={`boton-icono ${tipo}`} style={{ width: ancho }} onClick={onClick} aria-label={ariaLabel}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={`boton-icono ${tipo}`} style={{ width: ancho }} onClick={onClick} aria-label={ariaLabel}>
            <Icono nombre={icono} />
        </button>
    )
}

export default BotonIcono