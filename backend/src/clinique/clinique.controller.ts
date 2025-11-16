import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CliniqueService } from './clinique.service';
import { UpdateCliniqueDto } from './dto/update-clinique.dto';
import type { LoggedUser } from 'src/auth/strategy/jwt.strategy';
import { CurrUser } from 'src/shared/decorators/loggeduser.decorator';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { userRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { CreateCliniqueDto } from './dto/create-clinique.dto';
import { AssignUserCliniqueDto } from './dto/assignuser-clinique.dto';

@Controller('clinique')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CliniqueController {
  constructor(private readonly cliniqueService: CliniqueService) { }

  @Post()
  @Roles(userRole.SUPER_ADMIN, userRole.ADMIN)
  create(
    @Body() createCliniqueDto: CreateCliniqueDto,
    @CurrUser() user: LoggedUser,
  ) {
    return this.cliniqueService.create(createCliniqueDto, user.id);
  }

  @Get()
  findAll(
    @CurrUser() user: LoggedUser,
  ) {
    if (user.role === userRole.ADMIN) {
      return this.cliniqueService.findAdminCreatedClinics(user.id);
    }
    return this.cliniqueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cliniqueService.findOne(id);
  }
  @Patch("assign-user")
  @Roles(userRole.SUPER_ADMIN, userRole.ADMIN)
  assignUserToClinic(
    @Body() assignUserCliniqueDto: AssignUserCliniqueDto,
    @CurrUser() user: LoggedUser,
  ) {
    return this.cliniqueService.assignUserToClinic(assignUserCliniqueDto);
  }

  @Patch(':id')
  @Roles(userRole.SUPER_ADMIN, userRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCliniqueDto: UpdateCliniqueDto) {
    return this.cliniqueService.update(id, updateCliniqueDto);
  }

  @Delete(':id')
  @Roles(userRole.SUPER_ADMIN, userRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cliniqueService.remove(id);
  }


}
