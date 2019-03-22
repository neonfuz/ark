import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { parse as parseUrl } from 'url';
import { ErrorRenderer, RequestHandler } from './next-types'

@Catch()
export class RenderFilter implements ExceptionFilter {
  constructor(
    private readonly requestHandler: RequestHandler,
    private readonly errorRenderer: ErrorRenderer
  ) { }

  public async catch(err: any, ctx: ArgumentsHost) {
    const [req, res] = ctx.getArgs();

    const rawRes = res.res ? res.res : res;
    const rawReq = req.raw ? req.raw : req;

    if (!rawRes.headersSent) {
      if (err.response === undefined) {
        const { pathname, query } = parseUrl(rawReq.url, true);
        await this.errorRenderer(err, rawReq, rawRes, pathname, query);
      } else {
        await this.requestHandler(rawReq, rawRes);
      }
    }
  }
}
