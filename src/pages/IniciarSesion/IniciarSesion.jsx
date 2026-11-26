import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./IniciarSesion.css";

const API = import.meta.env.VITE_API_URL;

export default function IniciarSesion() {
  const navigate = useNavigate();
  const correoRef = useRef(null);
  const contrasenaRef = useRef(null);

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  function validarFormulario() {
    const nuevosErrores = {};

    if (!correo.trim()) {
      nuevosErrores.correo = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    }

    if (!contrasena.trim()) {
      nuevosErrores.contrasena = "Ingresa tu contraseña.";
    }

    setErrores(nuevosErrores);

    if (nuevosErrores.correo) {
      correoRef.current?.focus();
      return false;
    }

    if (nuevosErrores.contrasena) {
      contrasenaRef.current?.focus();
      return false;
    }

    return true;
  }

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setErrorGeneral("");

    if (!validarFormulario()) return;

    setCargando(true);

    try {
      const respuesta = await fetch(`${API}/sesion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: correo.trim(),
          password: contrasena,
        }),
      });

      let datos = {};
      try {
        datos = await respuesta.json();
      } catch {
        datos = {};
      }

      if (!respuesta.ok) {
        throw new Error(
          datos?.mensaje ??
          datos?.message ??
          (respuesta.status === 401
            ? "El correo o la contraseña son incorrectos."
            : "No fue posible iniciar sesión. Inténtalo nuevamente.")
        );
      }

      const token = datos?.token ?? datos?.datos?.token ?? datos?.access_token;
      const sesion = {
        ...datos,
        ...(token ? { token } : {}),
        correo: datos?.correo ?? datos?.usuario?.correo ?? correo.trim(),
      };
      const almacenamiento = mantenerSesion ? localStorage : sessionStorage;

      almacenamiento.setItem("taquilla-sesion", JSON.stringify(sesion));
      if (mantenerSesion) {
        sessionStorage.removeItem("taquilla-sesion");
      } else {
        localStorage.removeItem("taquilla-sesion");
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorGeneral(
        error instanceof TypeError
          ? "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."
          : error.message
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="inicio-sesion">
      <aside className="inicio-sesion-panel">
        <div className="inicio-sesion-panel-contenido">
          <p className="inicio-sesion-etiqueta">TAQUILLA</p>
          <h1 className="titular-display">Tu próxima experiencia empieza aquí.</h1>
          <p className="cuerpo-g">
            Ingresa para descubrir eventos, guardar tus favoritos y vivir cada experiencia.
          </p>
        </div>
        <span className="inicio-sesion-panel-pie cuerpo-p">Tu ciudad. Tus eventos. Tus momentos.</span>
      </aside>

      <div className="inicio-sesion-contenedor">
        <div className="inicio-sesion-formulario">
          <p className="inicio-sesion-volver cuerpo-p">
            ¿Aún no tienes una cuenta? <Link to="/crearCuenta">Crear cuenta</Link>
          </p>

          <header className="inicio-sesion-encabezado">
            <p className="cuerpo-p inicio-sesion-sobrelinea">BIENVENIDO DE NUEVO</p>
            <h2 className="titular-h1">Iniciar sesión</h2>
            <p className="cuerpo-m">Ingresa tus datos para continuar.</p>
          </header>

          <form onSubmit={iniciarSesion} noValidate>
            <div className="inicio-sesion-campo">
              <label className="cuerpo-p-fuerte" htmlFor="correo">Correo electrónico</label>
              <input
                ref={correoRef}
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                value={correo}
                onChange={(evento) => {
                  setCorreo(evento.target.value);
                  setErrores((actuales) => ({ ...actuales, correo: "" }));
                }}
                aria-invalid={Boolean(errores.correo)}
                aria-describedby={errores.correo ? "error-correo" : undefined}
              />
              {errores.correo && <span className="inicio-sesion-error detalle-nota" id="error-correo">{errores.correo}</span>}
            </div>

            <div className="inicio-sesion-campo">
              <div className="inicio-sesion-etiqueta-fila">
                <label className="cuerpo-p-fuerte" htmlFor="contrasena">Contraseña</label>
                <Link className="cuerpo-p" to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className={`inicio-sesion-contrasena ${errores.contrasena ? "con-error" : ""}`}>
                <input
                  ref={contrasenaRef}
                  id="contrasena"
                  name="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(evento) => {
                    setContrasena(evento.target.value);
                    setErrores((actuales) => ({ ...actuales, contrasena: "" }));
                  }}
                  aria-invalid={Boolean(errores.contrasena)}
                  aria-describedby={errores.contrasena ? "error-contrasena" : undefined}
                />
                <button
                  className="inicio-sesion-mostrar"
                  type="button"
                  onClick={() => setMostrarContrasena((valor) => !valor)}
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={mostrarContrasena}
                >
                  {mostrarContrasena ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errores.contrasena && <span className="inicio-sesion-error detalle-nota" id="error-contrasena">{errores.contrasena}</span>}
            </div>

            <label className="inicio-sesion-recordar cuerpo-p">
              <input
                type="checkbox"
                checked={mantenerSesion}
                onChange={(evento) => setMantenerSesion(evento.target.checked)}
              />
              Mantener la sesión iniciada
            </label>

            {errorGeneral && <p className="inicio-sesion-error-general cuerpo-p" role="alert">{errorGeneral}</p>}

            <button className="inicio-sesion-submit cuerpo-p-fuerte" type="submit" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="inicio-sesion-ayuda cuerpo-p">
            ¿Necesitas ayuda? <a href="mailto:soporte@taquilla.com">Contáctanos</a>
          </p>
        </div>
      </div>
    </section>
  );
}
