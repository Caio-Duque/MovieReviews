// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './login/Login.jsx';
import CreateUser from './login/CreateUser.jsx';
import ListaFilmes from './filme/ListaFilmes.jsx'; // Renomeado para refletir a mudança
import MovieReviews from './filme/MovieReviews';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <Login />
            },
            {
                path: 'criar-user',
                element: <CreateUser />
            }
        ]
    },
    {
        path: 'filmes', // Alterado para 'filmes'
        element: <ListaFilmes />
    },
    {
        path: 'filmes/:titulo', // Alterado para 'filmes'
        element: <ListaFilmes />
    },
    {
        path: 'filmes/:id/reviews',
        element: <MovieReviews />
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
