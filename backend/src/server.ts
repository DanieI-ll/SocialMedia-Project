import express, { Express } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import postRoutes from './routes/postRoutes';
import likeRoutes from './routes/likeRoutes';
import commentRoutes from './routes/commentRoutes';
import searchRoutes from './routes/searchRoutes';
import followRoutes from './routes/followRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';

const startServer = (): void => {
  const app: Express = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/posts', postRoutes);
  app.use('/likes', likeRoutes);
  app.use('/comments', commentRoutes);
  app.use('/api/users', searchRoutes);
  app.use('/', followRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/', userRoutes);

  const port: number = Number(process.env.PORT) || 3000;

  app.listen(port, () => console.log(`Server running on ${port} port`));
};

export default startServer;
