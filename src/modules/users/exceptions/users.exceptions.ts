import { ConflictException, NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(idOrEmail: string) {
    super(`Utilisateur avec l'identifiant ou email "${idOrEmail}" non trouvé`);
  }
}

export class UserAlreadyExistsException extends ConflictException {
  constructor() {
    super(`Un utilisateur avec cette l'email existe déjà`);
  }
}
