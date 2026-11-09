import './Boton.css'
import { Link } from 'react-router-dom'

const Boton = ({ className, tipo, href, onClick, children }) => {
    if (href) {
        return (
            <Link to={href} className={`boton ${className} ${tipo}`} onClick={onClick}>
                {children}
            </Link>
        );
    }

    return (
        <button className={`boton ${className} ${tipo}`} onClick={onClick}>
            {children}
        </button>
    );
}

export default Boton