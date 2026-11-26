import { useState } from 'react';
import './Navbar.css';
import Marca from '../../assets/logos/logo-normal.svg?react'
import MarcaInverso from '../../assets/logos/logo-inverso.svg?react'
import Boton from '../Boton/Boton';
import BotonIcono from '../BotonIcono/BotonIcono';
import SelectorIdioma from '../SelectorIdioma/SelectorIdioma'
import useMediaQuery from '../../hooks/useMediaQuery';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icono from '../Icono';

const Navbar = ({
  textos,
  cargando,
  en,
  alternarIdioma,
  onAbrirAccesibilidad,
  enlaces,
  usuario,
  onCerrarSesion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [consulta, setConsulta] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inicio = pathname === "/";
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [errorCerrarSesion, setErrorCerrarSesion] = useState("");
  const nav = textos?.navbar;
  const menuMovil = textos?.menuMovil;
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const nombreUsuario = String(
    usuario?.nombre_completo ??
    usuario?.nombreCompleto ??
    usuario?.nombre ??
    usuario?.name ??
    ([usuario?.nombres, usuario?.apellidos].filter(Boolean).join(" ") || nav?.usuario?.menu || "")
  );
  const correoUsuario = usuario?.correo ?? usuario?.email ?? "";

  function obtenerIniciales() {
    const partes = nombreUsuario.trim().split(/\s+/).filter(Boolean);
    return partes.length > 1
      ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
      : (partes[0]?.slice(0, 2) ?? "").toUpperCase();
  }

  async function salirDeLaCuenta() {
    try {
      setErrorCerrarSesion("");
      await onCerrarSesion?.();
      setCuentaAbierta(false);
      setIsOpen(false);
    } catch (error) {
      setErrorCerrarSesion(textos?.errores?.generico);
    }
  }

  function abrirAccesibilidad() {
    setIsOpen(false);
    onAbrirAccesibilidad?.();
  }

  return (
    <header className='header'>
      <div className={`header-mobile ${inicio ? "" : "header-mobile-claro"}`}>
        <Link to={enlaces.inicio} aria-label={nav?.logo?.aria}>{inicio ? <MarcaInverso /> : <Marca />}</Link>
        <div className="header-mobile-botones">
          <BotonIcono ancho={44} tipo={inicio ? "primario" : "fantasma"} icono="search" ariaLabel={nav?.buscador?.aria} onClick={() => navigate(enlaces.explorar)} />
          {!usuario && !isOpen && (
            <Boton className='cuerpo-p-fuerte' tipo={inicio ? 'primario' : 'fantasma'} href={enlaces['ingresar']}>
              {menuMovil?.botones?.ingresar}
            </Boton>
          )}
          <BotonIcono ancho={44} tipo={inicio ? "primario" : "fantasma"} icono="menu" ariaLabel={menuMovil?.abrir} aria-expanded={isOpen} aria-controls="menu-publico" onClick={() => setIsOpen(true)} />
        </div>
      </div>
      {cargando ? <div className='titular-h3 cargando'>{en ? 'Loading navigation...' : 'Cargando navegación...'}</div> :
        <nav id="menu-publico" className={`navbar ${isOpen ? 'open' : ''}`}>
          <div className="navbar-left">
            <div className='marca-navbar'>
              <Link to={enlaces.inicio} aria-label={nav?.logo?.aria}><Marca /></Link>
              {isMobile && <BotonIcono ancho={44} tipo='fantasma' icono='x' ariaLabel={menuMovil?.cerrar} onClick={() => setIsOpen(false)} />}
            </div>
            <div className="cuerpo-p-fuerte navbar-enlaces">
              <Link to={enlaces['inicio']}>{nav?.enlaces?.inicio}</Link>
              <Link to={enlaces['explorar']}>{nav?.enlaces?.explorar}</Link>
            </div>
          </div>
          <div className="navbar-right">
            <form className="buscador-navbar" onSubmit={(evento) => { evento.preventDefault(); navigate(`${enlaces.explorar}?${new URLSearchParams({ q: consulta.trim() })}`); }}>
              <Icono nombre="search" />
              <input className="cuerpo-p" type="search" aria-label={nav?.buscador?.aria} placeholder={nav?.buscador?.placeholder} value={consulta} onChange={(evento) => setConsulta(evento.target.value)} />
            </form>
            <div className='seccion-utilidades'>
              {isMobile && menuMovil?.secciones?.accesibilidad}
              <BotonIcono ancho={40} tipo='secundario' icono='person' ariaLabel={nav?.aria?.accesibilidad} onClick={abrirAccesibilidad} />
            </div>
            <div className='seccion-utilidades'>
              {isMobile && menuMovil?.secciones?.idioma}
              <SelectorIdioma textos={textos} en={en} alternarIdioma={alternarIdioma} aria-label={nav?.aria?.idioma} />
            </div>
            <div className="navbar-botones">
              {usuario ? (
                <div className="navbar-cuenta">
                  <button
                    className="avatar-usuario"
                    type="button"
                    aria-label={nav?.usuario?.menu}
                    aria-expanded={cuentaAbierta}
                    onClick={() => setCuentaAbierta((abierta) => !abierta)}
                  >
                    {obtenerIniciales()}
                  </button>
                  {cuentaAbierta && (
                    <div className="navbar-cuenta-menu">
                      <div className="navbar-cuenta-persona">
                        <span className="avatar-usuario">{obtenerIniciales()}</span>
                        <span className="navbar-cuenta-datos">
                          <strong>{nombreUsuario}</strong>
                          {correoUsuario && <small>{correoUsuario}</small>}
                        </span>
                      </div>
                      <button type="button" className="navbar-cerrar-sesion" onClick={salirDeLaCuenta}>
                        {nav?.usuario?.cerrarSesion}
                      </button>
                      {errorCerrarSesion && <p className="navbar-error-sesion" role="alert">{errorCerrarSesion}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Boton className='cuerpo-p-fuerte' tipo={isMobile ? 'primario' : 'secundario'} href={enlaces['ingresar']}>{nav?.botones?.ingresar}</Boton>
                  <Boton className='cuerpo-p-fuerte' tipo={isMobile ? 'secundario' : 'primario'} href={enlaces['crearCuenta']}>{nav?.botones?.crearCuenta}</Boton>
                </>
              )}
              {usuario && isMobile && (
                <div className="navbar-sesion-movil">
                  <div className="navbar-sesion-persona">
                    <span className="avatar-usuario">{obtenerIniciales()}</span>
                    <span className="navbar-cuenta-datos">
                      <strong>{nombreUsuario}</strong>
                      {correoUsuario && <small>{correoUsuario}</small>}
                    </span>
                  </div>
                  <button type="button" className="navbar-cerrar-sesion" onClick={salirDeLaCuenta}>
                    {nav?.usuario?.cerrarSesion}
                  </button>
                  {errorCerrarSesion && <p className="navbar-error-sesion" role="alert">{errorCerrarSesion}</p>}
                </div>
              )}
            </div>
          </div>
        </nav>
      }
    </header>
  )
};

export default Navbar;
