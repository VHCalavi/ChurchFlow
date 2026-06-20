export const GEM_CONFIG = {
  /**
   * false (défaut) = un membre ne peut appartenir qu'à un seul GEM.
   * true = un membre peut appartenir à plusieurs GEMs.
   * Si true, la contrainte unique dans GemMember est ignorée 
   * et la validation se fait dans le service.
   */
  ALLOW_MULTI_GEM: false,
} as const;
