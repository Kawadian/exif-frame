const supportLogo = new Map<string, HTMLImageElement>();

const assetUrl = (pathname: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = pathname.replace(/^\//, '');
  return `${base}${normalized}`;
};

const pendingLogoLoads: Promise<void>[] = [];

const loadLogo = (pathname: string): HTMLImageElement => {
  const image = new Image();
  const promise = new Promise<void>((resolve) => {
    image.onload = () => resolve();
    image.onerror = () => resolve();
  });
  pendingLogoLoads.push(promise);
  image.src = assetUrl(pathname);
  return image;
};

supportLogo.set('APPLE_LIGHT', loadLogo('/maker/light/apple.png'));
supportLogo.set('APPLE_DARK', loadLogo('/maker/dark/apple.png'));
supportLogo.set('CANON_LIGHT', loadLogo('/maker/light/canon.png'));
supportLogo.set('CANON_DARK', loadLogo('/maker/dark/canon.png'));
supportLogo.set('CONTAX_LIGHT', loadLogo('/maker/light/contax.png'));
supportLogo.set('CONTAX_DARK', loadLogo('/maker/dark/contax.png'));
supportLogo.set('DJI_LIGHT', loadLogo('/maker/light/dji.png'));
supportLogo.set('DJI_DARK', loadLogo('/maker/dark/dji.png'));
supportLogo.set('EPSON_LIGHT', loadLogo('/maker/light/epson.png'));
supportLogo.set('EPSON_DARK', loadLogo('/maker/dark/epson.png'));
supportLogo.set('FUJI_LIGHT', loadLogo('/maker/light/fujifilm.png'));
supportLogo.set('FUJI_DARK', loadLogo('/maker/dark/fujifilm.png'));
supportLogo.set('GOLDSTAR_LIGHT', loadLogo('/maker/light/goldstar.png'));
supportLogo.set('GOLDSTAR_DARK', loadLogo('/maker/dark/goldstar.png'));
supportLogo.set('HASSELBLAD_LIGHT', loadLogo('/maker/light/hasselblad.png'));
supportLogo.set('HASSELBLAD_DARK', loadLogo('/maker/dark/hasselblad.png'));
supportLogo.set('LEICA_LIGHT', loadLogo('/maker/light/leica.png'));
supportLogo.set('LEICA_DARK', loadLogo('/maker/dark/leica.png'));
supportLogo.set('LG_LIGHT', loadLogo('/maker/light/lg.png'));
supportLogo.set('LG_DARK', loadLogo('/maker/dark/lg.png'));
supportLogo.set('MAMIYA_LIGHT', loadLogo('/maker/light/mamiya.png'));
supportLogo.set('MAMIYA_DARK', loadLogo('/maker/dark/mamiya.png'));
supportLogo.set('NIKON_LIGHT', loadLogo('/maker/light/nikon.png'));
supportLogo.set('NIKON_DARK', loadLogo('/maker/dark/nikon.png'));
supportLogo.set('OLYMPUS_LIGHT', loadLogo('/maker/light/olympus.png'));
supportLogo.set('OLYMPUS_DARK', loadLogo('/maker/dark/olympus.png'));
supportLogo.set('OM_LIGHT', loadLogo('/maker/light/om.png'));
supportLogo.set('OM_DARK', loadLogo('/maker/dark/om.png'));
supportLogo.set('PANASONIC_LIGHT', loadLogo('/maker/light/lumix.png'));
supportLogo.set('PANASONIC_DARK', loadLogo('/maker/dark/lumix.png'));
supportLogo.set('PENTAX_LIGHT', loadLogo('/maker/light/pentax.png'));
supportLogo.set('PENTAX_DARK', loadLogo('/maker/dark/pentax.png'));
supportLogo.set('PHASEONE_LIGHT', loadLogo('/maker/light/phaseone.png'));
supportLogo.set('PHASEONE_DARK', loadLogo('/maker/dark/phaseone.png'));
supportLogo.set('RICOH_LIGHT', loadLogo('/maker/light/ricoh.png'));
supportLogo.set('RICOH_DARK', loadLogo('/maker/dark/ricoh.png'));
supportLogo.set('SAMSUNG_LIGHT', loadLogo('/maker/light/samsung.png'));
supportLogo.set('SAMSUNG_DARK', loadLogo('/maker/dark/samsung.png'));
supportLogo.set('SIGMA_LIGHT', loadLogo('/maker/light/sigma.png'));
supportLogo.set('SIGMA_DARK', loadLogo('/maker/dark/sigma.png'));
supportLogo.set('SONY_LIGHT', loadLogo('/maker/light/sony.png'));
supportLogo.set('SONY_DARK', loadLogo('/maker/dark/sony.png'));

const logosReadyPromise = Promise.all(pendingLogoLoads).then(() => undefined);

const whenMakerLogosReady = (): Promise<void> => logosReadyPromise;

const isLogoDrawable = (logo?: HTMLImageElement | null): logo is HTMLImageElement => {
  return !!logo && logo.complete && logo.naturalWidth > 0 && logo.naturalHeight > 0;
};

const normalize = (value?: string): string => (value || '').toUpperCase();

const includesAny = (haystack: string, ...needles: string[]): boolean => {
  return needles.some((needle) => haystack.includes(needle));
};

// Map of brand keywords to logo keys
const BRAND_KEYWORDS: Record<string, string[]> = {
  APPLE: ['APPLE'],
  CANON: ['CANON'],
  CONTAX: ['CONTAX'],
  DJI: ['DJI'],
  EPSON: ['EPSON'],
  FUJI: ['FUJI'],
  GOLDSTAR: ['GOLDSTAR'],
  HASSELBLAD: ['HASSELBLAD'],
  LEICA: ['LEICA'],
  LG: ['LG'],
  MAMIYA: ['MAMIYA'],
  NIKON: ['NIKON'],
  OLYMPUS: ['OLYMPUS'],
  OM: ['OM'],
  PANASONIC: ['PANASONIC'],
  PHASEONE: ['PHASE'],
  PENTAX: ['PENTAX'],
  RICOH: ['RICOH', 'RICO'],
  SIGMA: ['SIGMA'],
  SONY: ['SONY'],
  SAMSUNG: ['SAMSUNG'],
};

const pickLogoKey = (make?: string, model?: string): string | null => {
  const makeUpper = normalize(make);
  const modelUpper = normalize(model);

  for (const [logoKey, keywords] of Object.entries(BRAND_KEYWORDS)) {
    if (includesAny(makeUpper, ...keywords) || includesAny(modelUpper, ...keywords)) {
      return logoKey;
    }
  }

  return null;
};

const getCameraMakerLogo = (params: { darkMode: boolean; make?: string; model?: string }): HTMLImageElement | undefined => {
  const key = pickLogoKey(params.make, params.model);
  if (!key) return undefined;

  const logo = params.darkMode ? supportLogo.get(`${key}_DARK`) : supportLogo.get(`${key}_LIGHT`);
  // Incomplete or broken images throw InvalidStateError in drawImage and blank entire themes.
  if (!isLogoDrawable(logo)) return undefined;

  return logo;
};

const getLogoDrawSize = (logo: HTMLImageElement, targetHeight: number, maxWidth: number): { width: number; height: number } => {
  let height = targetHeight;
  let width = (logo.naturalWidth / logo.naturalHeight) * height;

  if (width > maxWidth) {
    width = maxWidth;
    height = (logo.naturalHeight / logo.naturalWidth) * maxWidth;
  }

  return { width, height };
};

export { getCameraMakerLogo, getLogoDrawSize, isLogoDrawable, whenMakerLogosReady };
