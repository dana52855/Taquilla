import './BannerCookies.css';
import Boton from '../Boton/Boton';

export default function BannerCookies({ textos, onAceptar, onRechazar }) {
  const banner = textos?.cookies?.banner;

  return (
    <section className="banner-cookies" aria-label={banner?.titulo} role="dialog" aria-live="polite">
      <div className="banner-cookies-texto">
        <p className="cuerpo-m-fuerte">{banner?.titulo}</p>
        <p className="cuerpo-p">{banner?.texto}</p>
      </div>

      <div className="banner-cookies-botones">
        <Boton className="cuerpo-p-fuerte" tipo="secundario" onClick={onRechazar}>
          {banner?.botones?.rechazar}
        </Boton>
        <Boton className="cuerpo-p-fuerte" tipo="primario" onClick={onAceptar}>
          {banner?.botones?.aceptar}
        </Boton>
      </div>
    </section>
  );
}
