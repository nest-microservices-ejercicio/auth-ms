import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers
      }
    }
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //- Eliminamos campos extras, que no tenemos en los dtos
      forbidNonWhitelisted: true, //- Retorna error si vienen campos extras en el dto
    })
  )

  console.log('hola peopleeeeeeeeeeee')

  await app.listen();
  
}
bootstrap();
