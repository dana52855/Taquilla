import { useEffect, useState } from 'react';
import './PanelAccesibilidad.css';
import Icono from '../Icono';

const CLAVE_PREFERENCIAS = 'taquilla-accesibilidad';

function leerPreferencias() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS));
    return {
      tamanoTexto: guardadas?.tamanoTexto ?? 0,
      altoContraste: guardadas?.altoContraste ?? false,
      reducirMovimiento: guardadas?.reducirMovimiento ?? false,
      subrayarEnlaces: guardadas?.subrayarEnlaces ?? false,
      espaciadoLectura: guardadas?.espaciadoLectura ?? false,
    };
  } catch {
    return {
      tamanoTexto: 0,
      altoContraste: false,
      reducirMovimiento: false,
      subrayarEnlaces: false,
      espaciadoLectura: false,
    };
  }
}

function obtenerTexto(valor) {
  if (typeof valor === 'string') return valor;
  return valor?.titulo ?? valor?.label ?? valor?.nombre ?? valor?.texto ?? valor?.descripcion ?? '';
}

export default function PanelAccesibilidad({ textos, abierto, onCerrar, enlaceDeclaracion }) {
  const [preferencias, setPreferencias] = useState(leerPreferencias);
  const panel = textos?.accesibilidad?.panel ?? textos?.accesibilidad;
  const opciones = panel?.opciones ?? panel;

  useEffect(() => {
    localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias));

    const cuerpo = document.body;
    cuerpo.classList.toggle('accesibilidad-alto-contraste', preferencias.altoContraste);
    cuerpo.classList.toggle('accesibilidad-reducir-movimiento', preferencias.reducirMovimiento);
    cuerpo.classList.toggle('accesibilidad-subrayar-enlaces', preferencias.subrayarEnlaces);
    cuerpo.classList.toggle('accesibilidad-espaciado-lectura', preferencias.espaciadoLectura);
    cuerpo.dataset.tamanoTexto = String(preferencias.tamanoTexto);
  }, [preferencias]);

  useEffect(() => {
    if (!abierto) return;

    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') onCerrar?.();
    }

    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [abierto, onCerrar]);

  if (!abierto || !panel) return null;

  function cambiarPreferencia(clave) {
    setPreferencias((actuales) => ({
      ...actuales,
      [clave]: !actuales[clave],
    }));
  }

  function cambiarTamanoTexto(cambio) {
    setPreferencias((actuales) => ({
      ...actuales,
      tamanoTexto: Math.min(2, Math.max(-1, actuales.tamanoTexto + cambio)),
    }));
  }

  function restablecer() {
    setPreferencias({
      tamanoTexto: 0,
      altoContraste: false,
      reducirMovimiento: false,
      subrayarEnlaces: false,
      espaciadoLectura: false,
    });
  }

  const filas = [
    { clave: 'altoContraste', contenido: opciones?.altoContraste },
    { clave: 'reducirMovimiento', contenido: opciones?.reducirMovimiento },
    { clave: 'subrayarEnlaces', contenido: opciones?.subrayarEnlaces },
    { clave: 'espaciadoLectura', contenido: opciones?.espaciadoLectura },
  ];

  return (
    <div className="accesibilidad-fondo" onMouseDown={(evento) => {
      if (evento.target === evento.currentTarget) onCerrar();
    }}>
      <section className="panel-accesibilidad" role="dialog" aria-modal="true" aria-labelledby="titulo-accesibilidad">
        <header className="panel-accesibilidad-encabezado">
          <h2 id="titulo-accesibilidad" className="titular-h3">{obtenerTexto(panel?.titulo)}</h2>
          <button className="panel-accesibilidad-cerrar" type="button" onClick={onCerrar} aria-label={obtenerTexto(panel?.cerrar ?? panel?.aria?.cerrar)}>
            <Icono nombre="x" />
          </button>
        </header>

        <div className="panel-accesibilidad-tamano">
          <h3 className="cuerpo-m-fuerte">{obtenerTexto(panel?.tamanoTexto?.titulo ?? panel?.tamanoTexto)}</h3>
          <div className="panel-accesibilidad-control">
            <button type="button" onClick={() => cambiarTamanoTexto(-1)} aria-label={obtenerTexto(panel?.tamanoTexto?.disminuir)} disabled={preferencias.tamanoTexto <= -1}>−</button>
            <span className="cuerpo-m-fuerte">A</span>
            <button type="button" onClick={() => cambiarTamanoTexto(1)} aria-label={obtenerTexto(panel?.tamanoTexto?.aumentar)} disabled={preferencias.tamanoTexto >= 2}>+</button>
          </div>
        </div>

        <div className="panel-accesibilidad-opciones">
          {filas.map(({ clave, contenido }) => (
            <div className="panel-accesibilidad-fila" key={clave}>
              <div className="panel-accesibilidad-descripcion">
                <p className="cuerpo-m-fuerte">{obtenerTexto(contenido?.titulo ?? contenido?.label ?? contenido)}</p>
                <p className="cuerpo-p">{obtenerTexto(contenido?.descripcion ?? contenido?.texto)}</p>
              </div>
              <button
                type="button"
                className={`panel-accesibilidad-interruptor ${preferencias[clave] ? 'activo' : ''}`}
                role="switch"
                aria-checked={preferencias[clave]}
                aria-label={obtenerTexto(contenido?.titulo)}
                onClick={() => cambiarPreferencia(clave)}
              >
                <span />
              </button>
            </div>
          ))}
        </div>

        <p className="panel-accesibilidad-nota detalle-nota">{obtenerTexto(panel?.nota ?? panel?.textoGuardado)}</p>

        <footer className="panel-accesibilidad-pie">
          <a href={enlaceDeclaracion}>{obtenerTexto(panel?.declaracion ?? panel?.enlaceDeclaracion)}</a>
          <button type="button" className="cuerpo-p-fuerte" onClick={restablecer}>
            {obtenerTexto(panel?.restablecer ?? panel?.botones?.restablecer)}
          </button>
        </footer>
      </section>
    </div>
  );
}
