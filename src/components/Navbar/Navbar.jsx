import { useState } from 'react';
import './Navbar.css';
import Marca from '../../assets/logos/logo-normal.svg?react'
import MarcaInverso from '../../assets/logos/logo-inverso.svg?react'
import Boton from '../Boton/Boton';
import BotonIcono from '../BotonIcono/BotonIcono';
import SelectorIdioma from '../SelectorIdioma/SelectorIdioma'
import useMediaQuery from '../../hooks/useMediaQuery';
import { Link } from 'react-router-dom';
import Icono from '../Icono';

const Navbar = ({
  textos,
  cargando,
  error,
  recargar,
  en,
  alternarIdioma,
  alternarTexto,
  enlaces
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const nav = textos?.navbar;
  const menuMovil = textos?.menuMovil;
  const isMobile = useMediaQuery("(max-width: 1023px)");

  return (
    <header className='header'>
      <div className="header-mobile">
        <MarcaInverso />
        <div className="header-mobile-botones">
          <BotonIcono ancho={44} tipo='primario' icono='search'></BotonIcono>
          {!isOpen && <Boton className='cuerpo-p-fuerte' tipo='primario' href={enlaces['ingresar']}>{menuMovil?.botones?.ingresar}</Boton>}
          <BotonIcono ancho={44} tipo='primario' icono='menu' onClick={() => setIsOpen(true)} />
        </div>
      </div>
      {cargando ? <div className='titular-h3 cargando'>{en ? 'Loading navigation...' : 'Cargando navegación...'}</div> :
        <nav className={`navbar ${isOpen ? 'open' : ''}`}>
          <div className="navbar-left">
            <div className='marca-navbar'>
              <Marca />
              {isMobile && <BotonIcono ancho={44} tipo='fantasma' icono='x' onClick={() => setIsOpen(false)}></BotonIcono>}
            </div>
            <div className="cuerpo-p-fuerte navbar-enlaces">
              <Link to={enlaces['inicio']}>{nav?.enlaces?.inicio}</Link>
              <Link to={enlaces['explorar']}>{nav?.enlaces?.explorar}</Link>
            </div>
          </div>
          <div className="navbar-right">
            <div className="buscador-navbar">
              <Icono nombre='search'></Icono>
              <input className='cuerpo-p' type="text" placeholder={nav?.buscador?.placeholder} />
            </div>
            <div className='seccion-utilidades'>
              {isMobile && menuMovil?.secciones?.accesibilidad}
              <BotonIcono ancho={40} tipo='secundario' icono='person' />
            </div>
            <div className='seccion-utilidades'>
              {isMobile && menuMovil?.secciones?.idioma}
              <SelectorIdioma en={en} alternarIdioma={alternarIdioma} />
            </div>
            <div className="navbar-botones">
              <Boton className='cuerpo-p-fuerte' tipo={isMobile ? 'primario' : 'secundario'} href={enlaces['ingresar']}>{nav?.botones?.ingresar}</Boton>
              <Boton className='cuerpo-p-fuerte' tipo={isMobile ? 'secundario' : 'primario'} href={enlaces['crearCuenta']}>{nav?.botones?.crearCuenta}</Boton>
            </div>
          </div>
        </nav>
      }
    </header >
  )
};

export default Navbar;