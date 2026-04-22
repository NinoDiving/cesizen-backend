import { NotFoundException, UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Email ou mot de passe invalide');
  }
}

export class AuthUserNotFoundException extends NotFoundException {
  constructor() {
    super('Utilisateur non trouvé dans la base de données locale');
  }
}

export class RegistrationFailedException extends UnauthorizedException {
  constructor(message?: string) {
    super(`Échec de l'inscription : ${message || 'Erreur inconnue'}`);
  }
}
