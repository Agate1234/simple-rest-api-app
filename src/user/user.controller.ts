import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto/';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('me')
    getMe(@GetUser('') user: User) {
        return user
    }

    @Patch()
    editUser(@Body() dto: EditUserDto, @GetUser('id') user_id: number) {
        return this.userService.EditUser(user_id, dto)
    }

}
