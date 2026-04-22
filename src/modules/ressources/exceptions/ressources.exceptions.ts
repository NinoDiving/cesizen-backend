import { NotFoundException } from '@nestjs/common';

export class RessourceNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Ressource avec l'identifiant "${id}" non trouvée`);
  }
}

export class TypeRessourceNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Type de ressource avec l'identifiant "${id}" non trouvé`);
  }
}

export class IllustrationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Illustration avec l'identifiant "${id}" non trouvée`);
  }
}
