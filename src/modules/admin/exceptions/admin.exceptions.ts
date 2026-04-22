import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class AdminActionForbiddenException extends ForbiddenException {
  constructor(reason: string) {
    super(`Action administrateur interdite : ${reason}`);
  }
}

export class RoleConfigurationException extends NotFoundException {
  constructor(roleName: string) {
    super(`Le rôle "${roleName}" n'est pas configuré dans la base de données`);
  }
}
