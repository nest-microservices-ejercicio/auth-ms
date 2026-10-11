import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('AuthService')

  constructor(
    private readonly jwtService: JwtService
  ) {
    super();
  }
  
  onModuleInit() {
    this.$connect();
    this.logger.log('Mongo DB connected')
  }

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload)
  }


  //? ------------- Registrar Usuario
  async registerUser(registerUserDto: RegisterUserDto) {

    const {email, name, password} = registerUserDto

    try{

      // 1. Verificamcos si ya existe el usuario
      const user = await this.user.findUnique({
        where: {email}
      });

      // 2. Si existe retornamos error
      if(user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists'
        })
      }

      // 3. Si no existe lo creamos 
      const newUser = await this.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          name
        }
      })

      const { password:__, ...rest } = newUser

      return {
        user: rest,
        token: await this.signJWT(rest)
      }

    }catch(error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }

  //? ------------- Login Usuario
  async loginUser(loginUserDto: LoginUserDto) {

    const {email, password} = loginUserDto

    try{

      // 1. Verificamcos si ya existe el usuario
      const user = await this.user.findUnique({
        where: { email }
      });

      // 2. Si no existe retornamos error
      if(!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid'
        })
      }

      // 3. Comparamos contraseñas
      const isPasswordValid = bcrypt.compareSync(password, user.password)

      // 4. Si no coinciden las contraeñas
      if(!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid'
        })
      }

      const {password: __, ...rest } = user

      return {
        user: rest,
        token: await this.signJWT(rest)
      }
      

    }catch(error) {
      throw new RpcException({
        status: 400,
        message: error.message
      })
    }
  }


  //? ------------ Verificamos el token y generamos uno nuevo
  async verifytoken(token: string) {

    try {

      const {sub, iat, exp, ...user} = this.jwtService.verify(token, {
        secret: envs.jwtSecret
      })

      return {
        user: user,
        token: await this.signJWT(user)
      }

    } catch(error) {
      console.log(error);
      throw new RpcException({
        status: 401,
        message: 'Invalid token'
      })
    }

  }

}
