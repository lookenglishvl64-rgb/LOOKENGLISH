import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE_PATH = path.join(__dirname, 'data', 'persisted_db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper to read database file
const readDatabase = (): any => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return null;
};

// Helper to write database file
const writeDatabase = (data: any): boolean => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
};

// =============================================================================
// BACKEND REST API ROUTES (ĐỒNG BỘ REAL-TIME ĐIỆN THOẠI & VI TÍNH)
// =============================================================================

// GET /api/sync - Retrieve latest server state
app.get('/api/sync', (req: Request, res: Response) => {
  const dbData = readDatabase();
  res.json({
    success: true,
    data: dbData,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/sync-batch - Update server database with client state
app.post('/api/sync-batch', (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, message: 'Missing data payload' });
  }

  const currentDb = readDatabase() || {};
  const updatedDb = {
    ...currentDb,
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  const saved = writeDatabase(updatedDb);
  res.json({
    success: saved,
    message: saved ? 'Dữ liệu đã được đồng bộ hóa lên server thành công' : 'Lỗi khi lưu dữ liệu',
    timestamp: new Date().toISOString(),
  });
});

// POST /api/clear-mock-data - Wipe all sample data as requested
app.post('/api/clear-mock-data', (req: Request, res: Response) => {
  const currentDb = readDatabase() || {};
  const cleanedDb = {
    ...currentDb,
    announcements: [],
    mediaItems: [],
    lastUpdated: new Date().toISOString(),
  };
  writeDatabase(cleanedDb);
  res.json({
    success: true,
    message: 'Đã xóa toàn bộ mock data tin tức & truyền thông thành công',
    data: cleanedDb,
  });
});

// Mount Vite or static server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LOOK ENGLISH SERVER] Running at http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
