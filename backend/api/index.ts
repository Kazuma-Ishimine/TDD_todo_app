import { handle } from '@hono/node-server/vercel';
import honoApp from '../src/index';

export default handle(honoApp);
