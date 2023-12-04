import React from 'react';
import { Link } from 'react-router-dom';
import MovieReviews from './MovieReviews/';

export default function Filme({ filme }) {
    return (
        <div className="filme-card">
            <h2>Título: {filme.titulo}</h2>
            <p>Descrição: {filme.descricao}</p>
            <Link to={`/filme/${filme.id}/review`}>
                <img src={filme.imagemUrl} alt={filme.titulo} className="filme-imagem" />
            </Link>
        </div>
    );
}
