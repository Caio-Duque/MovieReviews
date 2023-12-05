import React from 'react';
import { Link } from 'react-router-dom';

export default function Filme({ filme }) {
    return (
        <div className="filme-card">
            <Link to={`/filmes/${filme.id}/reviews`}>
                <h2>Título: {filme.titulo}</h2>
                <p>Descrição: {filme.descricao}</p>
                <img src={filme.imagemUrl} alt={filme.titulo} className="filme-imagem" />
            </Link>
        </div>
    );
}
