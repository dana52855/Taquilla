const archivos = import.meta.glob(
  "../assets/iconos/*.svg",
  {
    eager: true,
    query: "?react",
    import: "default",
  }
);

const iconos = Object.fromEntries(
  Object.entries(archivos).map(([ruta, Componente]) => {
    const nombre = ruta.split("/").pop().replace(".svg", "");
    return [nombre, Componente];
  })
);

export default function Icono({
  nombre,
  ...props
}) {
  const SvgIcon = iconos[nombre];

  if (!SvgIcon) {
    console.warn(`El icono "${nombre}" no existe.`);
    return null;
  }

  return (
    <SvgIcon
      {...props}
    />
  );
}