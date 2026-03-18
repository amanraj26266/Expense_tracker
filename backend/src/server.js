const app = require('./app');
const { connectDB } = require('./config/db');
const config = require('./config/env');

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on port ${config.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
