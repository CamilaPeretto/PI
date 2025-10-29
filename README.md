# Documentação do Projeto InBook

## Estrutura de Diretórios

```text
backend/
  config/db.js
  controllers/authController.js
  middleware/authMiddleware.js
  models/
    Livros.js
    User.js
  routes/
    adminRoutes.js
    authRoutes.js
    contatoRoutes.js
    Livrosroutes.js
    solicitacaoRoutes.js
    userRoutes.js
  server.js

frontend/
  admin/
    admin.html
    admin.js
  genero/
    genero.html
    genero.js
  home/
    home.html
    home.js
  login/
    login.html
    login.js
  modalAbrirModal/
    modalLivro.html
    modalLivro.js
  perfil/
    perfil.html
    perfil.js
  pesquisa/
    pesquisa.html
    pesquisa.js
  telaInicial/
    tela.html
  index.css

uploads/
  capas/
  livros/

package.json
package-lock.json
```

- backend: API em Node.js/Express, conexão MongoDB via Mongoose e autenticação JWT.
- frontend: páginas HTML/JS organizadas por área (admin, perfil, pesquisa, etc.).
- uploads: diretórios de armazenamento de capas e arquivos de livros enviados pelo admin.

## Padrões de Codificação

- Variáveis e funções em JavaScript: camelCase (ex.: `verificarToken`, `connectDB`).
- Nomes de modelos Mongoose no singular e capitalizado (ex.: `User`, `Livro`).
- Separação por camadas: `routes` (rotas), `controllers` (regras de negócio), `models` (schemas), `middleware` (auth/roles), `config` (DB).
- Async/await com tratamento de erros via try/catch e respostas JSON padronizadas com `success`, `message` e/ou dados.
- Comentários curtos e objetivos antes de blocos relevantes (ex.: propósito de rotas, validações, agregações).
- ES Modules habilitado (`"type": "module"` no `package.json`).

Exemplo de estilo de resposta em erro/sucesso:

```js
return res.status(400).json({ success: false, message: "Campos obrigatórios ausentes." });
res.status(201).json({ success: true, message: "Criado com sucesso!" });
```

## Documentação In-line (convenções)

- Rotas: comentário acima indicando método e caminho relativo (quando aplicável) e propósito.
- Middlewares: explicitar campos colocados em `req` (ex.: `req.user`) e papéis esperados (`admin`).
- Models: validações, enums e índices documentados próximo às definições do schema.
- Uploads: comentários junto à configuração do `multer` explicam limites e filtros.

Sugestão (opcional) para padronizar futuros comentários de handlers (estilo JSDoc simplificado):

```js
// POST /api/auth/login
// body: { email: string, senha: string }
// 200: { success: true, token: string, role: 'user'|'admin' }
// 400|401|500: { success: false, message: string }
```

## Documentação das APIs (Endpoints)

Base URL: `http://<host>:<port>` (padrão: `PORT=5000`). Todas as rotas abaixo já incluem o prefixo configurado no `server.js`.

Autenticação: JWT via header `Authorization: Bearer <token>` onde indicado.

### Auth (`/api/auth`)

- POST `/register`
  - body: { nome, email, senha, cpf?, dataNascimento? }
  - 201: { success: true, message }
  - 400|500: { success: false, message }

- POST `/login`
  - body: { email, senha }
  - 200: { success: true, token, role }
  - 400|401|500: { success: false, message }

- GET `/perfil` (auth)
  - headers: Authorization: Bearer <token>
  - 200: { success: true, user: { nome, email, cpf, dataNascimento } }
  - 404|500: { success: false, message }

- PUT `/update` (auth)
  - headers: Authorization: Bearer <token>
  - body (parcial): { nome?, email?, senha? }
  - 200: { success: true, user }
  - 500: { success: false, message }

- DELETE `/delete` (auth)
  - headers: Authorization: Bearer <token>
  - 200: { success: true, message }
  - 404|500: { success: false, message }

### Usuários (`/api/usuarios`)

- GET `/count`
  - 200: { total: number }
  - 500: { message }

### Livros Públicos (`/api/livros`)

- GET `/`
  - 200: [ { ...Livro } ] (ordenado por `createdAt` desc)
  - 500: { message }

- GET `/genero/:genero`
  - params: genero (case-insensitive)
  - 200: [ { ...Livro } ]
  - 500: { message }

- GET `/search`
  - query: `q` (busca por título ou autor, case-insensitive)
  - 200: [ { ...Livro } ]
  - 500: { message }

### Contato (`/api/contato`)

- POST `/`
  - body: { nome, email, assunto, mensagem }
  - 200: { success: true, message }
  - 400|500: { success: false, message }

### Solicitação de Livro (`/api/solicitacao-livro`)

- POST `/`
  - body: { titulo, autor, editora?, ano? }
  - 200: { success: true, message }
  - 400|500: { success: false, message }

### Admin (`/api/admin`) — requer `Authorization: Bearer <token>` com `role=admin`

- GET `/dados`
  - 200: {
      totalLivros,
      totalDownloads,
      totalUsuarios,
      livrosPorGenero: [ { _id: genero, count } ],
      livrosEsteMes
    }
  - 500: { message }

- GET `/livros`
  - query:
    - filtros: `titulo`, `autor`, `genero`, `formato`
    - datas: `dataPubDe`, `dataPubAte`, `dataAddDe`, `dataAddAte` (ISO ou `YYYY-MM-DD`)
    - paginação: `page` (1), `limit` (10)
  - 200: {
      livros: [ { id, titulo, autor, dataPub, dataAdd, genero, formato, sinopse, capa, arquivo, downloads } ],
      pagination: { currentPage, totalPages, totalLivros, hasNext, hasPrev }
    }
  - 500: { message }

- GET `/livros/:id`
  - 200: { id, titulo, autor, dataPublicacao, dataAdicao, genero, formato, sinopse, capa, arquivo, downloads }
  - 400|404|500: { message }

- POST `/livros` (multipart/form-data)
  - fields obrigatórios: `titulo`, `autor`, `dataPublicacao`, `genero`, `formato`, `sinopse?`
  - files: `capa` (image/*, máx ~5MB), `arquivo` (PDF, máx 50MB)
  - 201: { message, livro }
  - 400|500: { message, errors? }

- PUT `/livros/:id` (multipart/form-data)
  - fields parciais: `titulo?`, `autor?`, `dataPublicacao?`, `genero?`, `formato?`, `sinopse?`
  - files opcionais: `capa`, `arquivo` (substituem e removem os antigos)
  - 200: { message, livro }
  - 400|404|500: { message, errors? }

- DELETE `/livros/:id`
  - 200: { message }
  - 400|404|500: { message }

## Exemplos de Código (Trechos Chave)

Autenticação via middleware (JWT):

```js
// backend/middleware/authMiddleware.js
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ mensagem: "Token não fornecido." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    res.status(403).json({ mensagem: "Token inválido ou expirado." });
  }
}
```

Login e emissão de token:

```js
// backend/controllers/authController.js
export async function login(req, res) {
  const { email, senha } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ success: false, message: "Usuário não encontrado." });
  const isMatch = await bcrypt.compare(senha, user.senha);
  if (!isMatch) return res.status(401).json({ success: false, message: "Senha incorreta." });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.status(200).json({ success: true, token, role: user.role });
}
```

Busca de livros com filtros e paginação (admin):

```js
// backend/routes/adminRoutes.js
router.get("/livros", verificarToken, verificarAdmin, async (req, res) => {
  const { titulo, autor, genero, formato, dataPubDe, dataPubAte, dataAddDe, dataAddAte, page = 1, limit = 10 } = req.query;
  const filter = { ativo: true };
  if (titulo) filter.titulo = { $regex: titulo, $options: "i" };
  if (autor) filter.autor = { $regex: autor, $options: "i" };
  if (genero) filter.genero = genero;
  if (formato) filter.formato = formato;
  if (dataPubDe || dataPubAte) {
    filter.dataPublicacao = {};
    if (dataPubDe) filter.dataPublicacao.$gte = new Date(dataPubDe);
    if (dataPubAte) filter.dataPublicacao.$lte = new Date(dataPubAte);
  }
  if (dataAddDe || dataAddAte) {
    filter.createdAt = {};
    if (dataAddDe) filter.createdAt.$gte = new Date(dataAddDe + 'T00:00:00.000Z');
    if (dataAddAte) filter.createdAt.$lte = new Date(dataAddAte + 'T23:59:59.999Z');
  }
  const skip = (page - 1) * limit;
  const livros = await Livro.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('titulo autor dataPublicacao genero formato sinopse capa arquivo downloads createdAt').lean();
  const total = await Livro.countDocuments(filter);
  res.json({ livros: livros.map(l => ({ ...l, dataPub: l.dataPublicacao.toISOString().split('T')[0], dataAdd: l.createdAt.toISOString().split('T')[0], id: l._id.toString() })), pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalLivros: total, hasNext: page * limit < total, hasPrev: page > 1 } });
});
```

Schema de `Livro` com validações e índices:

```js
// backend/models/Livros.js
const livroSchema = new mongoose.Schema({
  titulo: { type: String, required: [true, "Título é obrigatório"], trim: true, maxlength: [200, "Título não pode ter mais de 200 caracteres"] },
  autor:  { type: String, required: [true, "Autor é obrigatório"], trim: true, maxlength: [100, "Autor não pode ter mais de 100 caracteres"] },
  dataPublicacao: { type: Date, required: [true, "Data de publicação é obrigatória"] },
  genero: { type: String, required: true, enum: { values: ["Ação","Autoajuda","Aventura","Biografia","Clássicos","Drama","Fantasia","Ficção Científica","História","Infantil","Mistério","Poesia","Policial","Psicologia","Religião","Romance","Suspense","Terror","Thriller"], message: "Gênero {VALUE} não é suportado" } },
  formato: { type: String, required: true, enum: { values: ["PDF","EPUB","MOBI"], message: "Formato {VALUE} não é suportado" } },
  sinopse: { type: String, maxlength: [2000, "Sinopse não pode ter mais de 2000 caracteres"], default: "" },
  capa: { filename: String, originalName: String, path: String, mimetype: String, url: String },
  arquivo: { filename: String, originalName: String, path: String, mimetype: String, size: Number, url: String },
  downloads: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });
```

## Execução

- Desenvolvimento: `npm run dev` (nodemon em `backend/server.js`).
- Produção: `npm start`.
- Variáveis de ambiente exigidas (exemplos):
  - Banco: `DB_USER`, `DB_PASS`, `DB_NAME`
  - JWT: `JWT_SECRET`, `JWT_EXPIRES_IN`
  - Email/SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM?`

---

Dúvidas ou ajustes desejados na documentação (mais exemplos, schemas de resposta etc.) podem ser indicados que eu atualizo aqui.
