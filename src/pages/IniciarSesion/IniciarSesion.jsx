import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Marca from "../../assets/logos/logo-normal.svg?react";
import MarcaInverso from "../../assets/logos/logo-inverso.svg?react";
import "./IniciarSesion.css";

const API = "https://yanethm-taquilla-api.fly.dev/api/v1";

export default function IniciarSesion({ onSesionIniciada }) {
  const navigate = useNavigate();
  const correoRef = useRef(null);
  const contrasenaRef = useRef(null);
  const envioEnCursoRef = useRef(false);

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [errorConexion, setErrorConexion] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [bloqueoHasta, setBloqueoHasta] = useState(null);

  const formularioBloqueado = cargando || segundosRestantes > 0;

  useEffect(() => {
    if (!bloqueoHasta) return undefined;

    function actualizarCuentaRegresiva() {
      const restantes = Math.max(0, Math.ceil((bloqueoHasta - Date.now()) / 1000));
      setSegundosRestantes(restantes);
      if (restantes === 0) setBloqueoHasta(null);
    }

    actualizarCuentaRegresiva();
    const intervalo = window.setInterval(actualizarCuentaRegresiva, 1000);
    return () => window.clearInterval(intervalo);
  }, [bloqueoHasta]);

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
    evento?.preventDefault?.();
    if (envioEnCursoRef.current || segundosRestantes > 0) return;
    setErrorGeneral("");
    setErrorConexion(false);

    if (!validarFormulario()) return;

    if (!API) {
      setErrorGeneral("No está configurada la dirección del servidor.");
      return;
    }

    envioEnCursoRef.current = true;
    setCargando(true);
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);

    try {
      const respuesta = await fetch(`${API}/sesion`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          correo: correo.trim(),
          clave: contrasena,
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
        const codigo = datos?.error?.codigo ?? datos?.codigo;

        if (respuesta.status === 401 || codigo === "credenciales_invalidas") {
          setErrorGeneral("Correo o contraseña incorrectos");
          return;
        }

        if (respuesta.status === 429 || codigo === "demasiadas_peticiones") {
          const retryAfter = respuesta.headers.get("Retry-After");
          let espera = Number(retryAfter);

          if (!Number.isFinite(espera) || espera <= 0) {
            const fechaReintento = Date.parse(retryAfter || "");
            espera = Number.isNaN(fechaReintento)
              ? 60
              : Math.max(1, Math.ceil((fechaReintento - Date.now()) / 1000));
          }

          setBloqueoHasta(Date.now() + espera * 1000);
          setSegundosRestantes(espera);
          setErrorGeneral("Has realizado demasiados intentos. Podrás volver a ingresar cuando termine la espera.");
          return;
        }

        setErrorGeneral(
          datos?.error?.mensaje ??
          datos?.mensaje ??
          datos?.message ??
          "No fue posible iniciar sesión. Inténtalo nuevamente."
        );
        return;
      }

      // Confirma los datos de la persona usando la sesión recién creada en la cookie httpOnly.
      let usuario = datos?.usuario ?? datos?.datos?.usuario ?? datos?.data?.usuario;

      try {
        const respuestaSesion = await fetch(`${API}/sesion`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (respuestaSesion.ok) {
          const datosSesion = await respuestaSesion.json();
          usuario =
            datosSesion?.usuario ??
            datosSesion?.datos?.usuario ??
            datosSesion?.data?.usuario ??
            datosSesion?.datos ??
            datosSesion?.data ??
            datosSesion ??
            usuario;
        }
      } catch (errorSesion) {
        console.error("No se pudieron recuperar los datos de la sesión:", errorSesion);
      }

      onSesionIniciada?.(usuario ?? { correo: correo.trim() });
      navigate("/", { replace: true });
    } catch (error) {
      if (error.name === "AbortError" || error instanceof TypeError) {
        setErrorConexion(true);
        setErrorGeneral("");
      } else {
        setErrorGeneral(error.message);
      }
    } finally {
      clearTimeout(limite);
      envioEnCursoRef.current = false;
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
                disabled={formularioBloqueado}
                placeholder="nombre@correo.com"
                value={correo}
                onChange={(evento) => {
                  setCorreo(evento.target.value);
                  setErrores((actuales) => ({ ...actuales, correo: "" }));
                  setErrorGeneral("");
                  setErrorConexion(false);
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
                  disabled={formularioBloqueado}
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(evento) => {
                    setContrasena(evento.target.value);
                    setErrores((actuales) => ({ ...actuales, contrasena: "" }));
                    setErrorGeneral("");
                    setErrorConexion(false);
                  }}
                  aria-invalid={Boolean(errores.contrasena)}
                  aria-describedby={errores.contrasena ? "error-contrasena" : undefined}
                />
                <button
                  className="inicio-sesion-ojo"
                  type="button"
                  disabled={formularioBloqueado}
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
                  disabled={formularioBloqueado}
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
              <div className="inicio-sesion-error-general cuerpo-p" role="alert">
                <strong>{errorGeneral}</strong>
                {errorGeneral.startsWith("Correo o contraseña incorrectos") && (
                  <span>Revisa los datos e inténtalo de nuevo. Si no recuerdas tu contraseña, puedes restablecerla.</span>
                )}
                {segundosRestantes > 0 && (
                  <span>Inténtalo de nuevo en {segundosRestantes} {segundosRestantes === 1 ? "segundo" : "segundos"}.</span>
                )}
              </div>
            )}

            {errorConexion && (
              <div className="inicio-sesion-error-general inicio-sesion-error-conexion cuerpo-p" role="alert">
                <div>
                  <strong>No pudimos conectarnos</strong>
                  <span>Revisa tu conexión a internet e inténtalo de nuevo. Lo que escribiste se conserva.</span>
                </div>
                <button type="button" onClick={() => iniciarSesion()} disabled={formularioBloqueado}>
                  Reintentar
                </button>
              </div>
            )}

            <button className="inicio-sesion-submit cuerpo-p-fuerte" type="submit" disabled={formularioBloqueado}>
              {cargando ? "Ingresando…" : segundosRestantes > 0 ? `Espera ${segundosRestantes}s` : "Ingresar"}
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
