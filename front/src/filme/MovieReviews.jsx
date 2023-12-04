// MovieReviews.js
import React, { useState } from 'react';

const MovieReviews = ({ movie }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const { id } = match.params;

  const filme = {
    id,
    title: 'Nome do Filme',
    description: 'Descrição do filme.',
    imageUrl: 'URL da imagem do filme',
  };


  const handleReviewSubmit = (e) => {
    e.preventDefault();

    // Aqui você pode enviar as críticas para o backend e armazenar no JSON
    const newReview = { rating, comment };
    setReviews([...reviews, newReview]);

    // Limpar o formulário após o envio
    setRating(1);
    setComment('');
  };

  return (
    <div>
      <h2>{filme.titulo}</h2>
      <p>{filme.descricao}</p>
      <img src={filme.imageUrl} alt={movie.titulo} className="filme-imagem"/>

      {/* Formulário para cadastrar nova crítica */}
      <form onSubmit={handleReviewSubmit}>
        <label>
          Nota (1-5):
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value, 10))}
          />
        </label>
        <br />
        <label>
          Comentário:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Enviar Crítica</button>
      </form>

      {/* Exibir críticas já cadastradas */}
      <h2>Criticas Cadastradas</h2>
      <ul>
        {reviews.map((review, index) => (
          <li key={index}>
            <p>Nota: {review.rating}</p>
            <p>Comentário: {review.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MovieReviews;
