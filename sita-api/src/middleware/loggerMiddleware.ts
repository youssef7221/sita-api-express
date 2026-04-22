import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  let responseBody: unknown;

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = ((body?: unknown) => {
    responseBody = body;
    return originalJson(body);
  }) as Response['json'];

  res.send = ((body?: unknown) => {
    responseBody = body;
    return originalSend(body);
  }) as Response['send'];

  const formatBody = (body: unknown): string => {
    if (typeof body === 'undefined') {
      return 'No response body';
    }

    if (Buffer.isBuffer(body)) {
      return body.toString('utf8');
    }

    if (typeof body === 'string') {
      return body;
    }

    try {
      return JSON.stringify(body);
    } catch {
      return 'Unserializable response body';
    }
  };

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    console.log(
      `[${timestamp}] ${req.method} ${req.url} ${res.statusCode} - ${durationMs}ms`
    );
    console.log(`Response: ${formatBody(responseBody)}`);
  });

  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body: ${JSON.stringify(req.body)}`);
  }
  next();
};
