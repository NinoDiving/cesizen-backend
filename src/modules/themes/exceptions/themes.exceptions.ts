import { NotFoundException } from '@nestjs/common';

export class ThemeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Thème avec l'identifiant "${id}" non trouvé`);
  }
}
