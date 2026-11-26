import './SelectorIdioma.css'

function SelectorIdioma({ textos, en, alternarIdioma, "aria-label": ariaLabel }) {
    return (
        <button className={`cuerpo-p-fuerte selector-idioma ${en ? "en" : ""}`} onClick={alternarIdioma} aria-label={ariaLabel}>

            <span className='selector-idioma-indicador'></span>

            <div className={!en ? "selected" : ""}>
                {textos?.idioma?.codigoEs}
            </div>
            <div className={en ? "selected" : ""}>
                {textos?.idioma?.codigoEn}
            </div>

        </button>
    );
}

export default SelectorIdioma;
