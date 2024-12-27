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

// Use tracking routes
app.use('/track', trackingRoutes);

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

