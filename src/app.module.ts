import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from './config.service';
import { AppController } from './app.controller';
import { CacheService } from './cache.service';
import { ConfigModule } from './config.module';
import { AppHandler } from './app.handler';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'SHORTENER_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [{
              hostname: config.get('BUS_HOST'),
              username: config.get('BUS_USER'),
              password: config.get('BUS_PASS'),
              port: +config.get('BUS_PORT'),
            }],
            queue: 'shortener_queue',
            queueOptions: {
              durable: false
            },
            prefetchCount: 1,
          },
        }),
      }
    ])
    // ClientsModule.register([
    //   {
    //     name: 'SHORTENER_CLIENT',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: [{
    //         hostname: process.env.BUS_HOST,
    //         username: process.env.BUS_USER,
    //         password: process.env.BUS_PASS,
    //         port: +process.env.BUS_PORT,
    //       }],
    //       queue: 'shortener_queue',
    //       queueOptions: {
    //         durable: false
    //       },
    //       prefetchCount: 1,
    //     },
    //   }
    // ]),
  ],
  controllers: [AppController, AppHandler],
  providers: [CacheService],
})
export class AppModule {}
