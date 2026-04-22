import { NotFoundException } from '@nestjs/common';

export class ActivityNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Activité avec l'identifiant "${id}" non trouvée`);
  }
}

export class TypeActivityNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Type d'activité avec l'identifiant "${id}" non trouvé`);
  }
}
