import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../styles/MovieReviews.css';

export default function MovieReviews() {
    const { id } = useParams();
    const [filme, setFilme] = useState(null);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState('');
    const [comentario, setComentario] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchAvaliacoes = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/avaliacoes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setAvaliacoes(response.data);

            const userAvaliacao = response.data.find(avaliacao => avaliacao.userId === currentUser);
            setUserReview(userAvaliacao);
        } catch (error) {
            console.error('Erro ao obter avaliações do filme:', error);
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
                console.error('Erro ao obter detalhes do filme:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMovieDetails();
    }, [id, currentUser]);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        setCurrentUser(userId);
    }, []);

    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem('token');

            if (userReview) {
                console.log('Usuário já avaliou este filme.');
                return;
            }

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

            fetchAvaliacoes();
            setNota('');
            setComentario('');
        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
        }
    };

    const handleEditAvaliacao = () => {
        setIsEditing(true);
        setNota(userReview.nota);
        setComentario(userReview.comentario);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNota('');
        setComentario('');
    };

    const handleUpdateAvaliacao = async () => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/avaliacoes/${userReview.id}`,
                {
                    nota,
                    comentario,
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            fetchAvaliacoes();
            setIsEditing(false);
            setNota('');
            setComentario('');
        } catch (error) {
            console.error('Erro ao atualizar avaliação:', error);
        }
    };

    const handleDeleteAvaliacao = async () => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`http://localhost:3000/avaliacoes/${userReview.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            fetchAvaliacoes();
            setIsEditing(false);
            setNota('');
            setComentario('');
        } catch (error) {
            console.error('Erro ao excluir avaliação:', error);
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
            <nav>
                <ul>
                    <li>
                        <Link to={'/'}>Login</Link>
                    </li>
                    <li>
                        <Link to={'/filmes'}>Filmes</Link>
                    </li>
                    <li>
                        <Link to={'/meu-perfil'}>Meu Perfil</Link>
                    </li>
                </ul>
            </nav>
            <h2>{filme.titulo}</h2>
            <p>{filme.descricao}</p>
            <img src={filme.imagemUrl} alt={filme.titulo} />

            <h3>Avaliações cadastradas</h3>
            {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id}>
                    <div className='reviews'>
                        <p>Usuário: {avaliacao.usuario}</p>
                        <p>Nota: {avaliacao.nota}</p>
                        <p>Comentário: {avaliacao.comentario}</p>
                    </div>
                    {currentUser === avaliacao.userId && (
                        <>
                            <button onClick={handleEditAvaliacao}>Editar Avaliação</button>
                            <button onClick={handleDeleteAvaliacao}>Excluir Avaliação</button>
                        </>
                    )}
                </div>
            ))}

            {!userReview && !isEditing && (
                <div>
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
            )}

            {isEditing && (
                <div>
                    <h3>Editando sua avaliação</h3>
                    <form onSubmit={handleUpdateAvaliacao}>
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
                        <button type="button" onClick={handleCancelEdit}>Cancelar Edição</button>
                        <button type="submit">Atualizar Avaliação</button>
                    </form>
                </div>
            )}
        </div>
    );
}
