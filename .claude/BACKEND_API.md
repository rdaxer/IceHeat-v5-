# 🔌 Secure Backend API with Node.js/Express

Enterprise-grade API mit PostgreSQL, JWT, und Best Practices.

## 🚀 Quick Start

```bash
# Create project
mkdir my-api && cd my-api
npm init -y

# Install dependencies
npm install express dotenv cors helmet jsonwebtoken bcryptjs pg axios
npm install -D typescript @types/express @types/node ts-node nodemon

# Initialize TypeScript
npx tsc --init

# Create src/index.ts
mkdir src
```

## 📦 Full Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.1.2",
    "bcryptjs": "^2.4.3",
    "pg": "^8.11.3",
    "axios": "^1.6.5",
    "uuid": "^9.0.1",
    "joi": "^17.11.0",
    "morgan": "^1.10.0",
    "pino": "^8.17.2",
    "pino-http": "^8.6.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/bcryptjs": "^2.4.6",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.3",
    "dotenv-cli": "^7.1.0"
  }
}
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/
│   │   ├── database.ts       # PostgreSQL connection
│   │   ├── env.ts            # Environment variables
│   │   └── jwt.ts            # JWT configuration
│   ├── routes/
│   │   ├── auth.ts           # Auth endpoints
│   │   ├── users.ts          # User management
│   │   ├── app.ts            # App specific endpoints
│   │   └── index.ts          # Route aggregation
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   └── appController.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   └── emailService.ts
│   ├── models/
│   │   ├── user.ts
│   │   ├── token.ts
│   │   └── app.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   ├── rateLimit.ts
│   │   └── logging.ts
│   ├── utils/
│   │   ├── crypto.ts         # Encryption utilities
│   │   ├── validators.ts
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── database/
│       ├── migrations/
│       └── schema.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── scripts/
│   ├── migrate.ts
│   └── seed.ts
├── .env.example
├── docker-compose.yml
├── .dockerignore
└── tsconfig.json
```

## 🔐 Security Configuration

### 1. Environment Setup (.env)

```env
# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgres://user:password@localhost:5432/myapp_prod
DATABASE_POOL_SIZE=20

# JWT
JWT_SECRET=your-very-long-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://app.example.com,https://www.example.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@example.com

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=15m

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id
```

### 2. Express Setup with Security Headers

```typescript
// src/index.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { pinoHttp } from 'pino-http';
import { config } from './config/env';
import { pool } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';

const app = express();

// Security Middleware
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}));

// CORS Configuration
app.use(cors({
  origin: config.CORS_ORIGIN.split(','),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Logging
app.use(pinoHttp());
app.use(morgan('combined'));

// Request Logging Middleware
app.use(requestLogger);

// Rate Limiting (see middleware below)
app.use('/api/', rateLimit);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
```

### 3. Database Configuration

```typescript
// src/config/database.ts
import { Pool, PoolClient } from 'pg';
import { config } from './env';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: config.DATABASE_POOL_SIZE,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
  } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Health check
pool.query('SELECT 1', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('✓ Database connected');
  }
});

export { pool };

// Migration runner
export async function runMigrations() {
  const migrationPath = path.join(__dirname, '../database/migrations');
  const files = fs.readdirSync(migrationPath).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const sql = fs.readFileSync(path.join(migrationPath, file), 'utf-8');
      try {
        await pool.query(sql);
        console.log(`✓ Ran migration: ${file}`);
      } catch (error) {
        console.error(`✗ Migration failed: ${file}`, error);
        throw error;
      }
    }
  }
}
```

### 4. Authentication Service

```typescript
// src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { config } from '../config/env';
import { sendPasswordResetEmail } from './emailService';
import { generateRandomToken } from '../utils/crypto';

interface LoginResult {
  token: string;
  refreshToken: string;
  user: any;
}

export class AuthService {
  static async register(email: string, password: string, name: string) {
    // Validate email not exist
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password with Argon2 (or bcrypt fallback)
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    return result.rows[0];
  }

  static async login(email: string, password: string): Promise<LoginResult> {
    // Get user
    const result = await pool.query(
      'SELECT id, email, password, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  static async requestPasswordReset(email: string) {
    const user = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return; // Don't reveal if email exists
    }

    const resetToken = generateRandomToken();
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
      [resetToken, expires, user.rows[0].id]
    );

    await sendPasswordResetEmail(email, resetToken);
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );
  }
}
```

### 5. JWT Middleware

```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### 6. Rate Limiting Middleware

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const redisClient = redis.createClient();

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
});

export const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'login-limit:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 min
  skipSuccessfulRequests: true,
});
```

### 7. Input Validation

```typescript
// src/middleware/validation.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(12)
      .pattern(/[A-Z]/) // At least one uppercase
      .pattern(/[0-9]/) // At least one number
      .pattern(/[!@#$%^&*(),.?":{}|<>]/) // At least one special char
      .required(),
    name: Joi.string().min(2).max(100).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export function validate(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }
    req.body = value;
    next();
  };
}
```

### 8. Error Handler

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  console.error('Unexpected error:', error);

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
  });
}
```

## 📝 Database Schema

```sql
-- src/database/migrations/001_initial.sql

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  reset_token VARCHAR(255),
  reset_expires TIMESTAMP
);

CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'access', 'refresh'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  method VARCHAR(10) NOT NULL,
  path VARCHAR(500) NOT NULL,
  status_code INTEGER NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tokens_user_id ON tokens(user_id);
CREATE INDEX idx_tokens_expires ON tokens(expires_at);
```

## 🧪 Testing

```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../src/index';

describe('Authentication', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

## 🚀 Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

## 📋 Security Checklist

- [ ] All passwords hashed (Argon2/bcrypt)
- [ ] JWT tokens with expiration
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS properly configured
- [ ] HTTPS enforced (in production)
- [ ] Secrets in environment variables
- [ ] Error messages don't reveal sensitive info
- [ ] Logging doesn't include passwords/tokens
- [ ] Regular dependency updates
- [ ] Database backups automated

## 🔗 Resources

- Express.js: https://expressjs.com
- JSON Web Tokens: https://jwt.io
- OWASP API Security: https://owasp.org/www-project-api-security/
- PostgreSQL: https://www.postgresql.org/docs/
