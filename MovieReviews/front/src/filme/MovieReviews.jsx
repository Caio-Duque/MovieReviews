import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/MovieReviews.css';

// Componente principal da página de avaliações de filmes
export default function MovieReviews() {
    // pegar o parâmetro de rota para obter o ID do filme
    const { id } = useParams();

    // Estados para armazenar informações sobre o filme, avaliações, etc.
    const [filme, setFilme] = useState(null);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState('');
    const [comentario, setComentario] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Função para buscar as avaliações do filme do back
    const fetchAvaliacoes = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/avaliacoes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setAvaliacoes(response.data);

            // Verifica se o usuário atual já deixou uma avaliação para este filme
            const userAvaliacao = response.data.find(avaliacao => avaliacao.userId === currentUser);
            setUserReview(userAvaliacao);
        } catch (error) {
            console.error('Error fetching movie reviews:', error);
        }
    };

    // Buscar dados do filme e avaliações quando o componente é montado
    useEffect(() => {
        async function fetchMovieDetails() {
            try {
                const token = sessionStorage.getItem('token');
                let response;

                // Verifica se o ID do filme é um número ou um título
                if (!isNaN(id)) {
                    response = await axios.get(`http://localhost:3000/filmes/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                } else {
                    response = await axios.get(`http://localhost:3000/filmes/titulo/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                }

                // Atualiza o componente com os dados do filme
                setFilme(response.data);
                // Busca as avaliações do filme
                fetchAvaliacoes();
            } catch (error) {
                console.error('Error fetching movie details:', error);
            } finally {
                setLoading(false);
            }
        }

        // Chama a função para buscar dados do filme
        fetchMovieDetails();
    }, [id, currentUser]);

    // para pegar o ID do usuário atual ao montar o componente
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        setCurrentUser(userId);
    }, []);

    // Função para lidar com o envio de uma avaliação
    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem('token');

            // Verifica se o usuário já avaliou este filme
            if (userReview) {
                console.log('Usuário já avaliou este filme.');
                return;
            }

            // Chama a API para cadastrar uma nova avaliação
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

            // Atualiza as avaliações após o cadastro bem-sucedido
            fetchAvaliacoes();
            // Limpa os campos de nota e comentário
            setNota('');
            setComentario('');
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // Função para lidar com a edição de uma avaliação
    const handleEditAvaliacao = () => {
        setIsEditing(true);
        // Preenche os campos de nota e comentário com os dados da avaliação existente
        setNota(userReview.nota);
        setComentario(userReview.comentario);
    };

    // Função para cancelar a edição de uma avaliação
    const handleCancelEdit = () => {
        setIsEditing(false);
        // Limpa os campos de nota e comentário
        setNota('');
        setComentario('');
    };

    // Função para lidar com a atualização de uma avaliação
    const handleUpdateAvaliacao = async () => {
        try {
            const token = sessionStorage.getItem('token');
            // Chama a API para atualizar a avaliação existente
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

            // Atualiza as avaliações após a atualização bem-sucedida
            fetchAvaliacoes();
            // Finaliza o modo de edição e limpa os campos de nota e comentário
            setIsEditing(false);
            setNota('');
            setComentario('');
        } catch (error) {
            console.error('Error updating review:', error);
        }
    };

    // Função para lidar com a exclusão de uma avaliação
    const handleDeleteAvaliacao = async () => {
        try {
            const token = sessionStorage.getItem('token');
            // Chama a API para excluir a avaliação existente
            await axios.delete(`http://localhost:3000/avaliacoes/${userReview.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Atualiza as avaliações após a exclusão
            fetchAvaliacoes();
            // Finaliza o modo de edição e limpa os campos de nota e comentário
            setIsEditing(false);
            setNota('');
            setComentario('');
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    // Caso o filme não seja encontrado
    if (!filme) {
        return <p>Filme não encontrado!</p>;
    }

    return (
        <div>
            {}
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
            
            {/* Dados do filme */}
            <h2>{filme.titulo}</h2>
            <p>{filme.descricao}</p>
            <img src={filme.imagemUrl} alt={filme.titulo} />

            {/* Avaliações cadastradas */}
            <h3>Avaliações cadastradas</h3>
            {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id}>
                    <div className='reviews'>
                        <p>Usuário: {avaliacao.usuario}</p>
                        <p>Nota: {avaliacao.nota}</p>
                        <p>Comentário: {avaliacao.comentario}</p>
                    </div>
                    {/* Botões de edição/exclusão visíveis apenas para o autor da avaliação */}
                    {currentUser === avaliacao.userId && (
                        <>
                            <button onClick={handleEditAvaliacao}>Editar Avaliação</button>
                            <button onClick={handleDeleteAvaliacao}>Excluir Avaliação</button>
                        </>
                    )}
                </div>
            ))}

            {/* Formulário para deixar uma nova avaliação */}
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

            {/* Formulário para editar uma avaliação existente */}
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
