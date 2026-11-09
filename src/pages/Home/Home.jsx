import './Home.css'

const Home = ({ datos, en, enlaces }) => {
    const { cargando } = datos;
    return (
        cargando ? <div className="titular-h3 cargando">{en ? 'Loading home...' : 'Cargando inicio...'}</div> : <></>
    )
}

export default Home