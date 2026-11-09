const Portada = ({ tamano = 'p', patron, color1, color2 }) => {
    let ancho;
    let alto;
    if (tamano == 'g') {
        console.log("True")
        ancho = 480;
        alto = 440;
    } else if (tamano == 'p') {
        ancho = 300;
        alto = 176;
    }
  const renderizarPlantilla = () => {
    return (
      <>
        <defs>
            <linearGradient id="fondo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset='0%' stopColor={color1}/>
                <stop offset='100%' stopColor={color2}/>
            </linearGradient>
        </defs>
        <rect width={ancho} height={alto} fill="url(#fondo)"/>
        <circle cx="408" cy="48" r="168" fill="#FFFFFF" opacity="0.12"/>
        <circle cx="50" cy="428" r="108" fill="#000000" opacity="0.15"/>
      </>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {renderizarPlantilla()}
    </svg>
  );
};

export default Portada;
