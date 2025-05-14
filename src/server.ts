import app from './index';
import { initMockData } from './initMockData';

const PORT = process.env.PORT || 3000;

initMockData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server ready on http://localhost:${PORT}`);
  });
});