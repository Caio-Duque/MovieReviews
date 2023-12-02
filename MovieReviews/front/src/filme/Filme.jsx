import React from 'react';

export default function Filme({ filme }) {
    return (
        <div className="filme-card">
            <h2>Título: {filme.titulo}</h2>
            <p>Descrição: {filme.descricao}</p>
            <img src={filme.imagemUrl} alt={filme.titulo} className="filme-imagem" />
        </div>
    );
}
