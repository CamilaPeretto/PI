export function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Rota não encontrada' });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Erro interno do servidor'
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}


