// server.js
const next = require('next');
const path = require('path');
const { app } = require('./lib/express');
import { express } from './express'
import { NextApiRequest, NextApiResponse } from 'next';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 8000;

nextApp.prepare().then(() => {
  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Handle all other requests with Next.js
  app.all('*', (req: NextApiRequest, res: NextApiResponse) => {
    return handle(req, res);
  });

  app.listen(PORT, (err: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});