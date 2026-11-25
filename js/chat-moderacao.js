(function(root) {
  const termosExplicitos = [
    'arrombada', 'arrombado', 'asshole', 'bitch', 'bosta', 'boquete', 'buceta',
    'cacete', 'caralho', 'corno', 'cunt', 'cu', 'dick', 'desgraca', 'foda',
    'fode', 'foder', 'fodeu', 'fodida', 'fodido', 'fodendo', 'fuck', 'fucker',
    'fucking', 'gozar', 'masturbacao', 'masturbar', 'merda', 'motherfucker',
    'penis', 'pica', 'pinto', 'porra', 'puta', 'putaria', 'puto', 'pussy',
    'shit', 'shitty', 'tesao', 'vagina'
  ];

  function contemTermoExplicito(texto) {
    const normalizado = String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[0]/g, 'o')
      .replace(/[1!]/g, 'i')
      .replace(/[3]/g, 'e')
      .replace(/[4@]/g, 'a')
      .replace(/[5$]/g, 's')
      .replace(/[7]/g, 't');

    return termosExplicitos.some(termo => {
      const letrasSeparadas = termo.split('').join('[^a-z0-9]*');
      return new RegExp(`(^|[^a-z0-9])${letrasSeparadas}($|[^a-z0-9])`).test(normalizado);
    });
  }

  const api = { contemTermoExplicito };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.FreeLinkChatModeration = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
