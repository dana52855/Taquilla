import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Marca from "../../assets/logos/logo-normal.svg?react";
import MarcaInverso from "../../assets/logos/logo-inverso.svg?react";
import "./IniciarSesion.css";
import useApi from "../../hooks/useApi";

export default function IniciarSesion({ textos, onSesionIniciada }) {
  const solicitar = useApi();
  const ingreso = textos?.paginas?.ingresar;
  const presentacion = ingreso?.presentacion;
  const formulario = ingreso?.formulario;
  const erroresIngreso = ingreso?.errores;
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
      nuevosErrores.correo = erroresIngreso?.correoObligatorio;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nuevosErrores.correo = textos?.formularios?.validacion?.correoInvalido;
    }

    if (!contrasena) {
      nuevosErrores.contrasena = erroresIngreso?.claveObligatoria;
    }

    setErrores(nuevosErrores);

    if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      correoRef.current?.focus();
      return false;
    }

    if (!contrasena) {
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

    envioEnCursoRef.current = true;
    setCargando(true);
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);

    try {
      const respuesta = await solicitar("/sesion", {
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
          setErrorGeneral(erroresIngreso?.credenciales?.titulo);
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
          setErrorGeneral(erroresIngreso?.demasiadosIntentos?.titulo);
          return;
        }

        setErrorGeneral(
          textos?.errores?.[codigo] ?? textos?.errores?.generico
        );
        return;
      }

      // Confirma los datos de la persona usando la sesión recién creada en la cookie httpOnly.
      let usuario = datos?.usuario ?? datos?.datos?.usuario ?? datos?.data?.usuario;

      try {
        const respuestaSesion = await solicitar("/sesion", {
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
        setErrorGeneral(textos?.errores?.generico);
      }
    } finally {
      clearTimeout(limite);
      envioEnCursoRef.current = false;
      setCargando(false);
    }
  }

  return (
    <main className="inicio-sesion">
      <title>{ingreso?.seo?.titulo}</title>
      <meta name="description" content={ingreso?.seo?.descripcion} />
      <aside className="inicio-sesion-portada">
        <Link className="inicio-sesion-logo-inverso" to="/" aria-label={textos?.navbar?.logo?.aria}>
          <MarcaInverso />
        </Link>

        <div className="inicio-sesion-beneficios">
          <h1 className="titular-display">{presentacion?.lema}</h1>
          <ul>
            <li><span aria-hidden="true">✓</span>{presentacion?.beneficios?.descubre}</li>
            <li><span aria-hidden="true">✓</span>{presentacion?.beneficios?.filtra}</li>
            <li><span aria-hidden="true">✓</span>{presentacion?.beneficios?.consulta}</li>
          </ul>
        </div>
      </aside>

      <section className="inicio-sesion-contenido" aria-labelledby="titulo-iniciar-sesion">
        <div className="inicio-sesion-formulario">
          <Link className="inicio-sesion-logo-movil" to="/" aria-label={textos?.navbar?.logo?.aria}>
            <Marca />
          </Link>

          <header className="inicio-sesion-encabezado">
            <h2 className="titular-h1" id="titulo-iniciar-sesion">{formulario?.titulo}</h2>
            <p className="cuerpo-m">{formulario?.subtitulo}</p>
          </header>

          <form onSubmit={iniciarSesion} noValidate>
            <div className="inicio-sesion-campo">
              <label className="cuerpo-p-fuerte" htmlFor="correo">{formulario?.etiquetas?.correo}</label>
              <input
                ref={correoRef}
                id="correo"
                name="email"
                type="email"
                autoComplete="email"
                disabled={formularioBloqueado}
                placeholder={formulario?.placeholders?.correo}
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
              <label className="cuerpo-p-fuerte" htmlFor="contrasena">{formulario?.etiquetas?.clave}</label>
              <div className="inicio-sesion-contrasena">
                <input
                  ref={contrasenaRef}
                  id="contrasena"
                  name="password"
                  type={mostrarContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={formularioBloqueado}
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
                  aria-label={mostrarContrasena ? formulario?.botones?.ocultarClave : formulario?.botones?.mostrarClave}
                  aria-pressed={mostrarContrasena}
                  title={mostrarContrasena ? formulario?.botones?.ocultarClave : formulario?.botones?.mostrarClave}
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
                <span>{formulario?.etiquetas?.mantenerSesion}</span>
              </label>
              <Link className="cuerpo-p inicio-sesion-recuperar" to="/recuperar-contrasena">
                {formulario?.enlaces?.olvidasteClave}
              </Link>
            </div>

            {errorGeneral && (
              <div className="inicio-sesion-error-general cuerpo-p" role="alert">
                <strong>{errorGeneral}</strong>
                {errorGeneral === erroresIngreso?.credenciales?.titulo && (
                  <span>{erroresIngreso?.credenciales?.texto}</span>
                )}
                {segundosRestantes > 0 && (
                  <span>{erroresIngreso?.demasiadosIntentos?.texto?.replace("{segundos}", segundosRestantes)}</span>
                )}
              </div>
            )}

            {errorConexion && (
              <div className="inicio-sesion-error-general inicio-sesion-error-conexion cuerpo-p" role="alert">
                <div>
                  <strong>{erroresIngreso?.conexion?.titulo}</strong>
                  <span>{erroresIngreso?.conexion?.texto}</span>
                </div>
                <button type="button" onClick={() => iniciarSesion()} disabled={formularioBloqueado}>
                  {erroresIngreso?.conexion?.botones?.reintentar}
                </button>
              </div>
            )}

            <button className="inicio-sesion-submit cuerpo-p-fuerte" type="submit" disabled={formularioBloqueado}>
              {cargando ? formulario?.mensajes?.ingresando : formulario?.botones?.ingresar}
            </button>
          </form>

          <p className="inicio-sesion-crear cuerpo-p">
            {formulario?.mensajes?.sinCuenta} <Link to="/crearCuenta">{formulario?.enlaces?.crearCuenta}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
