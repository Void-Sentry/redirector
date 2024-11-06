import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { CacheService } from './cache.service';
import { AppHandler } from './app.handler';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SHORTENER_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [{
            hostname: process.env.BUS_HOST,
            username: process.env.BUS_USER,
            password: process.env.BUS_PASS,
            port: +process.env.BUS_PORT,
          }],
          queue: 'shortener_queue',
          queueOptions: {
            durable: false
          },
          prefetchCount: 1,
        },
      }
    ]),
  ],
  controllers: [AppController, AppHandler],
  providers: [CacheService],
})
export class AppModule {}
