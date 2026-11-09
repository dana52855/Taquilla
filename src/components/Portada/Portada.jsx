const Portada = ({ tamano = 'p', patron, color1, color2 }) => {
    let ancho;
    let alto;
    if (tamano == 'g') {
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
            <linearGradient id={`gradiente-${color1}-${color2}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset='0%' stopColor={color1}/>
                <stop offset='100%' stopColor={color2}/>
            </linearGradient>
        </defs>
        <rect width={ancho} height={alto} fill={`url(#gradiente-${color1}-${color2})`}/>
        <circle cx={tamano=='p'?"255":"408"} cy={tamano=='p'?"27":"48"} r={tamano=='p'?"105":"168"} fill="#FFFFFF" opacity="0.12"/>
        <circle cx={tamano=='p'?"34":"50"} cy={tamano=='p'?"168":"428"} r={tamano=='p'?"70":"108"} fill="#000000" opacity="0.15"/>
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
