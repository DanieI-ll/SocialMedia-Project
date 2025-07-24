import 'dotenv/config';

import './db/models/User';
import './db/models/Post';
import './db/models/Comment';
import './db/models/Like';
import './db/models/Follow';
import './db/models/Notification';

import startServer from './server';
import connectDatabase from './db/connectDatabase';

const bootstrap = async () => {
  await connectDatabase();
  startServer();
};

bootstrap();
