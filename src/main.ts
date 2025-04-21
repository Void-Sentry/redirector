import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, Logger } from 'winston';
import { ConfigService } from './config.service';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger: Logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new DailyRotateFile({
      filename: '/redirector/logs/redirector-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  const config = app.get(ConfigService);
  
  app.useLogger(WinstonModule.createLogger({ instance: logger }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [{
        // hostname: process.env.BUS_HOST,
        // username: process.env.BUS_USER,
        // password: process.env.BUS_PASS,
        // port: +process.env.BUS_PORT,
        hostname: config.get('BUS_HOST'),
        username: config.get('BUS_USER'),
        password: config.get('BUS_PASS'),
        port: +config.get('BUS_PORT'),
      }],
      queue: config.get('BUS_QUEUE'),
      queueOptions: {
        durable: false
      },
      prefetchCount: 1,
    },
  });

  // swagger
  const options = new DocumentBuilder()
    .setTitle('Url shortener')
    .setDescription('redirect server')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('redirect/api', app, document);

  await app.startAllMicroservices();
  await app.listen({ host: config.get('HOST'), port: +config.get('PORT') });
}
bootstrap();
