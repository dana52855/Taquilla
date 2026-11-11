import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import BannerCookies from "../components/BannerCookies/BannerCookies.jsx";
import PanelAccesibilidad from "../components/PanelAccesibilidad/PanelAccesibilidad.jsx";
import { Outlet } from "react-router-dom";

export default function LayoutPublico({
  datos,
  en,
  alternarIdioma,
  alternarTexto,
  enlaces,
  consentimiento,
  onAceptarCookies,
  onRechazarCookies,
  accesibilidadAbierta,
  onAbrirAccesibilidad,
  onCerrarAccesibilidad,
}) {
  return (
    <div className="sitio">
      <Navbar
        {...datos}
        en={en}
        alternarIdioma={alternarIdioma}
        alternarTexto={alternarTexto}
        onAbrirAccesibilidad={onAbrirAccesibilidad}
        enlaces={enlaces}
      />
      <main>
        <Outlet />
      </main>
      <Footer
        {...datos}
        en={en}
        enlaces={enlaces}
      />
      {consentimiento === null && (
        <BannerCookies
          textos={datos?.textos}
          onAceptar={onAceptarCookies}
          onRechazar={onRechazarCookies}
        />
      )}
      <PanelAccesibilidad
        textos={datos?.textos}
        abierto={accesibilidadAbierta}
        onCerrar={onCerrarAccesibilidad}
        enlaceDeclaracion={enlaces?.accesibilidad}
      />
    </div>
  );
}
