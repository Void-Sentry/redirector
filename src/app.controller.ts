import { Controller, Get, Inject, Param, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientRMQ } from '@nestjs/microservices';
import { CacheService } from './cache.service';
import { Request, Response } from 'express';
import { lookup } from 'geoip-lite';

@ApiTags('URL Shortener')
@Controller()
export class AppController {
  constructor(
    @Inject('SHORTENER_CLIENT')
    private readonly shortenerClient: ClientRMQ,
    private readonly cacheService: CacheService,
  ) {}

  @ApiOperation({ summary: 'List user shortened URLs' })
  @ApiOperation({ summary: 'Redirect to original URL by shortened code' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the original URL associated with the shortened code.',
  })
  @ApiResponse({
    status: 404,
    description: 'The shortened URL code does not exist or is invalid.',
  })
  @Get(':code')
  async redirect(@Param('code') code: string, @Req() req: Request, @Res() res: Response) {
    const originalUrl = await this.cacheService.client.get('code');

    // Handle the case where the original URL is not found.
    if (!originalUrl)
      return res.status(404).send('Shortened URL not found');

    const userAgent = req.headers['user-agent'];
    const ip = (process.env.FAKE_IP || req.headers['X-Forwarded-For'] || req.ip) as string;
    const { country } = lookup(ip);

    this.shortenerClient.emit('URL_CLICKED', { originalUrl, code, ip, userAgent, country });
    res.redirect(originalUrl);
  }
}
