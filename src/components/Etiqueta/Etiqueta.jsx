import "./Etiqueta.css";

const Etiqueta = ({ tono = "neutro", children }) => {
  return (
    <div className={`detalle-nota-fuerte etiqueta ${tono}`}>
      {(tono == "exito" || tono == "alerta" || tono == "error") && (
        <div
          className={`etiqueta-dot`}
          style={{ background: `var(--estado-${tono})` }}
        />
      )}
      <div>{children}</div>
    </div>
  );
};

export default Etiqueta;
