import serverless from 'serverless-http';
import app from '../backend/src/app.js';

const handler = serverless(app);

export default handler;
export { handler };
