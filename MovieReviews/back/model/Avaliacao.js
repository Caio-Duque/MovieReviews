class Avaliacao {
  constructor(id, userId, filmeId, nota, comentario, usuario) {
      this.id = id;
      this.userId = userId;
      this.filmeId = filmeId;
      this.nota = nota;
      this.comentario = comentario;
      this.usuario = usuario;
  }
}

module.exports = Avaliacao;
