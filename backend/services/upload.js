import multer from 'multer';
import path from 'path';
import fs from 'fs';

export function ensureUploadDirs() {
  const dirs = ['uploads/capas', 'uploads/livros'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'capa') cb(null, 'uploads/capas/');
    else if (file.fieldname === 'arquivo') cb(null, 'uploads/livros/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'capa') {
      if (file.mimetype.startsWith('image/')) return cb(null, true);
      return cb(new Error('Apenas imagens são permitidas para capas'));
    }
    if (file.fieldname === 'arquivo') {
      const allowedTypes = ['.pdf'];
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExt)) return cb(null, true);
      return cb(new Error('Apenas arquivos PDF são permitidos'));
    }
    cb(null, true);
  }
});

export function handleUploadErrors(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Arquivo muito grande. Máx: 50MB (livros), 5MB (capas)' });
    }
  } else if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
}


