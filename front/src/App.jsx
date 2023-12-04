// src/App.jsx

import './styles/CreateUser.css';
import { Outlet } from 'react-router-dom';

function App() {
    return (
        <>
            <section className='LoginUser'>
                <header className='titulo'>
                    <h1>Bem vindo ao sistema de cadastro do MovieReviews!</h1>
                </header>
                <Outlet />
            </section>
        </>
    );
}

export default App;

