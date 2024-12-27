import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import trackingRoutes from './routes/trackingRoutes';
import { CONFIG } from './config';
import { log } from './utils/logger';
import { specs } from './swagger';

const app = express();

app.use(cors());
app.use(express.json());

// API Key Middleware
const apiKeyMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.header('X-RapidAPI-Key');
  if (!apiKey || apiKey !== CONFIG.API_KEY) {
    return res.status(401).json({ status: 'error', message: 'Invalid API Key' });
  }
  next();
};

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Logging middleware
app.use((req, res, next) => {
  log(`${req.method} ${req.path}`, { query: req.query, params: req.params, body: req.body });
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Add a root route
app.get('/', (req, res) => {
  res.json({ message: 'Poslaju Tracking API is running' });
});

// Apply API Key middleware to tracking routes
app.use('/track', apiKeyMiddleware, trackingRoutes);

// 404 handler
app.use((req, res) => {
  log('404 Not Found', { path: req.path });
  res.status(404).json({ status: 'error', message: 'Not Found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  log('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

app.listen(CONFIG.PORT, () => {
  log(`Server is running on port ${CONFIG.PORT}`);
  log(`API documentation available at http://localhost:${CONFIG.PORT}/api-docs`);
});

