import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from '../src/server/handler';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  return handleApiRequest(req, res);
}

