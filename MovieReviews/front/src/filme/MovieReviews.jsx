import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function MovieReviews() {
    const { id } = useParams();
    const [filme, setFilme] = useState(null);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState('');
    const [comentario, setComentario] = useState('');

    const fetchAvaliacoes = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/avaliacoes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setAvaliacoes(response.data);
        } catch (error) {
            console.error('Error fetching movie reviews:', error);
        }
    };

    useEffect(() => {
        async function fetchMovieDetails() {
            try {
                const token = sessionStorage.getItem('token');
                let response;

                if (!isNaN(id)) {
                    response = await axios.get(`http://localhost:3000/filmes/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                } else {
                    response = await axios.get(`http://localhost:3000/filmes/titulo/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                }

                setFilme(response.data);
                fetchAvaliacoes();
            } catch (error) {
                console.error('Error fetching movie details:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMovieDetails();
    }, [id]);

    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem('token');
            await axios.post(
                `http://localhost:3000/avaliacoes`,
                {
                    filmeId: id,
                    nota,
                    comentario,
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            // após cadastrar a avaliação, recarrega as avaliações
            fetchAvaliacoes();
            // limpa os campos do formulário
            setNota('');
            setComentario('');
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (!filme) {
        return <p>Filme não encontrado!</p>;
    }

    return (
        <div>
            <h2>{filme.titulo}</h2>
            <p>{filme.descricao}</p>
            <img src={filme.imagemUrl} alt={filme.titulo} />

            <h3>Avaliações cadastradas</h3>
            {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id}>
                    <p>Usuário: {avaliacao.usuario}</p>
                    <p>Nota: {avaliacao.nota}</p>
                    <p>Comentário: {avaliacao.comentario}</p>
                </div>
            ))}

            <h3>Deixe sua avaliação</h3>
            <form onSubmit={handleSubmitAvaliacao}>
                <label>
                    Nota:
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Comentário:
                    <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                    />
                </label>
                <br />
                <button type="submit">Enviar Avaliação</button>
            </form>
        </div>
    );
}
