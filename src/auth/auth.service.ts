import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

    async signup(dto: AuthDto) {

        // generate password hash
        const hash = await argon.hash(dto.password)

        // save new user di db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            })

            // sign token
            return this.signToken(user.id, user.email)

        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    throw new ForbiddenException(
                        'User Email Sudah Ada',
                    )
                }
            }
            throw err
        }
    }

    async signin(dto: AuthDto) {

        // temukan user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        // jika user tidak ada, throw exception
        if (!user)
            throw new ForbiddenException(
                'User Email Tidak Ditemukan'
            )

        // compare password
        const pwMatch = await argon.verify(
            user.hash,
            dto.password
        )

        // jika password salah, throw exception
        if (!pwMatch)
            throw new ForbiddenException(
                'User Password Salah'
            )

        // sign token
        return this.signToken(user.id, user.email)
    }

    async signToken(user_id: number, email: string): Promise<{access_token: string}> {
        const payload = {
            sub: user_id,
            email
        }

        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1h',
            secret: secret
        });

        return {
            access_token: token,
        }
    }

}