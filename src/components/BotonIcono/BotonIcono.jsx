import './BotonIcono.css'
import Icono from '../Icono'
import { Link } from 'react-router-dom'

const BotonIcono = ({ ancho, tipo, href, onClick, icono, ariaLabel, children, ...atributos }) => {
    if (href) {
        return (
            <Link to={href} className={`boton-icono ${tipo}`} style={{ width: ancho }} onClick={onClick} aria-label={ariaLabel} {...atributos}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={`boton-icono ${tipo}`} style={{ width: ancho }} onClick={onClick} aria-label={ariaLabel} {...atributos}>
            <Icono nombre={icono} />
        </button>
    )
}

export default BotonIcono