import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Marca from "../../assets/logos/logo-normal.svg?react";
import MarcaInverso from "../../assets/logos/logo-inverso.svg?react";
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

    if (!contrasena) {
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

    if (!API) {
      setErrorGeneral("No está configurada la dirección del servidor.");
      return;
    }

    setCargando(true);
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);

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
        signal: controlador.signal,
      });

      let datos = {};
      try {
        datos = await respuesta.json();
      } catch {
        datos = {};
      }

      if (!respuesta.ok) {
        if (respuesta.status === 401 || respuesta.status === 403) {
          throw new Error("El correo o la contraseña son incorrectos.");
        }

        throw new Error(
          datos?.mensaje ??
          datos?.message ??
          "No fue posible iniciar sesión. Inténtalo nuevamente."
        );
      }

      const informacion = datos?.datos ?? datos?.data ?? datos;
      const sesion = {
        ...informacion,
        token:
          informacion?.token ??
          informacion?.access_token ??
          informacion?.accessToken ??
          null,
        refreshToken:
          informacion?.refreshToken ??
          informacion?.refresh_token ??
          null,
        usuario:
          informacion?.usuario ??
          informacion?.user ??
          informacion?.cliente ??
          { email: correo.trim() },
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
      if (error.name === "AbortError") {
        setErrorGeneral("El servidor tardó demasiado en responder. Inténtalo de nuevo.");
      } else if (error instanceof TypeError) {
        setErrorGeneral("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
      } else {
        setErrorGeneral(error.message);
      }
    } finally {
      clearTimeout(limite);
      setCargando(false);
    }
  }

  return (
    <main className="inicio-sesion">
      <aside className="inicio-sesion-portada">
        <Link className="inicio-sesion-logo-inverso" to="/" aria-label="Taquilla, ir al inicio">
          <MarcaInverso />
        </Link>

        <div className="inicio-sesion-beneficios">
          <h1 className="titular-display">Tu próxima noche empieza aquí.</h1>
          <ul>
            <li><span aria-hidden="true">✓</span>Descubre conciertos, teatro y deportes</li>
            <li><span aria-hidden="true">✓</span>Filtra por categoría, fecha y ciudad</li>
            <li><span aria-hidden="true">✓</span>Consulta horario, lugar y cómo llegar</li>
          </ul>
        </div>
      </aside>

      <section className="inicio-sesion-contenido" aria-labelledby="titulo-iniciar-sesion">
        <div className="inicio-sesion-formulario">
          <Link className="inicio-sesion-logo-movil" to="/" aria-label="Taquilla, ir al inicio">
            <Marca />
          </Link>

          <header className="inicio-sesion-encabezado">
            <h2 className="titular-h1" id="titulo-iniciar-sesion">Ingresa a tu cuenta</h2>
            <p className="cuerpo-m">Ingresa con el correo y la contraseña de tu cuenta.</p>
          </header>

          <form onSubmit={iniciarSesion} noValidate>
            <div className="inicio-sesion-campo">
              <label className="cuerpo-p-fuerte" htmlFor="correo">Correo electrónico</label>
              <input
                ref={correoRef}
                id="correo"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                value={correo}
                onChange={(evento) => {
                  setCorreo(evento.target.value);
                  setErrores((actuales) => ({ ...actuales, correo: "" }));
                  setErrorGeneral("");
                }}
                aria-invalid={Boolean(errores.correo)}
                aria-describedby={errores.correo ? "error-correo" : undefined}
              />
              {errores.correo && (
                <span className="inicio-sesion-error detalle-nota" id="error-correo" role="alert">
                  {errores.correo}
                </span>
              )}
            </div>

            <div className={`inicio-sesion-campo inicio-sesion-campo-contrasena ${errores.contrasena ? "con-error" : ""}`}>
              <label className="cuerpo-p-fuerte" htmlFor="contrasena">Contraseña</label>
              <div className="inicio-sesion-contrasena">
                <input
                  ref={contrasenaRef}
                  id="contrasena"
                  name="password"
                  type={mostrarContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(evento) => {
                    setContrasena(evento.target.value);
                    setErrores((actuales) => ({ ...actuales, contrasena: "" }));
                    setErrorGeneral("");
                  }}
                  aria-invalid={Boolean(errores.contrasena)}
                  aria-describedby={errores.contrasena ? "error-contrasena" : undefined}
                />
                <button
                  className="inicio-sesion-ojo"
                  type="button"
                  onClick={() => setMostrarContrasena((valor) => !valor)}
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={mostrarContrasena}
                  title={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {mostrarContrasena ? (
                      <>
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.3 3.1" />
                        <path d="M6.2 6.2C3.9 7.6 2.8 9.5 2.5 12c.8 2.1 4.2 7 9.5 7 1.2 0 2.3-.2 3.3-.7" />
                      </>
                    ) : (
                      <>
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errores.contrasena && (
                <span className="inicio-sesion-error detalle-nota" id="error-contrasena" role="alert">
                  {errores.contrasena}
                </span>
              )}
            </div>

            <div className="inicio-sesion-opciones">
              <label className="inicio-sesion-recordar cuerpo-p">
                <input
                  type="checkbox"
                  checked={mantenerSesion}
                  onChange={(evento) => setMantenerSesion(evento.target.checked)}
                />
                <span>Mantener la sesión iniciada</span>
              </label>
              <Link className="cuerpo-p inicio-sesion-recuperar" to="/recuperar-contrasena">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {errorGeneral && (
              <p className="inicio-sesion-error-general cuerpo-p" role="alert">
                {errorGeneral}
              </p>
            )}

            <button className="inicio-sesion-submit cuerpo-p-fuerte" type="submit" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="inicio-sesion-crear cuerpo-p">
            ¿No tienes cuenta? <Link to="/crearCuenta">Crea una cuenta</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
