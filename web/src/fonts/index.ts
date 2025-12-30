enum Font {
  Digital7 = 'digital-7',
  Poxel = 'poxel',
  DINAlternateBold = 'din-alternate-bold',
  Pretendard = 'pretendard',
}

// Load all fonts from the fonts public/fonts folder
Object.values(Font).forEach((font) => new FontFace(font, `url(fonts/${font}.ttf)`).load().then((loadedFont) => document.fonts.add(loadedFont)));

// Detect system fonts
export const getSystemFonts = async (): Promise<string[]> => {
  const systemFonts = ['Default', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS', 'Trebuchet MS', 'Impact'];
  
  // Try to detect more fonts using FontFaceSet
  const availableFonts: string[] = ['Default'];
  
  for (const font of systemFonts) {
    if (font === 'Default') continue;
    // Check if font is available by trying to load it
    try {
      await document.fonts.load(`12px "${font}"`);
      if (document.fonts.check(`12px "${font}"`)) {
        availableFonts.push(font);
      }
    } catch (e) {
      // Font not available
    }
  }
  
  return availableFonts;
};

export default Font;
