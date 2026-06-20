const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`✔ Mghagha Store server running on http://localhost:${env.port}`);
});
