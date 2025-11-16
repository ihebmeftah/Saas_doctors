import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user';
import { userRole } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@Controller('users')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    @Get()
    getUsers(@Query('role') role?: userRole) {
        return this.usersService.getUsers(role);
    }
    @Get(':role/:id')
    findUserById(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('role', new ParseEnumPipe(userRole)) role: userRole,
    ) {
        return this.usersService.findUserById(id, role);
    }

    @Post('create-admin')
    @Roles()
    createAdmin(@Body() userDto: CreateUserDto) {
        return this.usersService.createAdmin(userDto);
    }

    @Post('create-recep')
    @Roles(userRole.SUPER_ADMIN, userRole.ADMIN)
    createReceptionist(@Body() userDto: CreateUserDto) {
        return this.usersService.createReceptionist(userDto);
    }

    @Post('create-patient')
    @Roles(userRole.RECEP)
    createPatient(@Body() userDto: CreateUserDto) {
        return this.usersService.createPatient(userDto);
    }

    @Post('create-doctor')
    @Roles(userRole.SUPER_ADMIN, userRole.ADMIN)
    createDoctor(@Body() userDto: CreateUserDto) {
        return this.usersService.createDoctor(userDto);
    }

    @Delete(':role/:id')
    deleteUserById(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('role', new ParseEnumPipe(userRole)) role: userRole,
    ) {
        return this.usersService.deleteUserById(id, role);
    }
}
