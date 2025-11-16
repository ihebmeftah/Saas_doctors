import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { userRole } from 'src/users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { LoggedUser } from 'src/auth/strategy/jwt.strategy';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }


    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<userRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ],);
        if (!requiredRoles) return true;
        const request = context.switchToHttp().getRequest();
        if (!request.user) throw new ForbiddenException('User not found in request');
        const user = request.user as LoggedUser;
        console.log(`PATH [${request.method} ${request.path}]:`, 'Current role :', user.role, 'Required Roles: ', requiredRoles);
        const isAuthorized = requiredRoles.some((role) => user.role.includes(role));
        if (!isAuthorized) {
            throw new ForbiddenException(`Only ${requiredRoles} are authorized to access this route, current role is ${user.role}`);
        } else {
            return true;
        }
    }

}