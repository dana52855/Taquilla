import './Boton.css'
import { Link } from 'react-router-dom'

const Boton = ({ className, tipo, href, onClick, children, ...atributos }) => {
    if (href) {
        return (
            <Link to={href} className={`boton ${className} ${tipo}`} onClick={onClick} {...atributos}>
                {children}
            </Link>
        );
    }

    return (
        <button className={`boton ${className} ${tipo}`} onClick={onClick} {...atributos}>
            {children}
        </button>
    );
}

export default Boton