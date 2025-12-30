// Common aspect ratios available for theme customization
// Note: Decimal ratios like '2.39:1' are supported because the sandbox function
// uses Number() which correctly parses decimal strings like '2.39'
export const ASPECT_RATIO_OPTIONS = [
  'free',      // Uses global setting
  '1:1',       // Square (Instagram)
  '4:5',       // Portrait (Instagram)
  '9:16',      // Vertical (Stories, Reels)
  '2:3',       // Standard portrait photography
  '3:4',       // 4:3 portrait
  '5:4',       // Traditional portrait
  '3:2',       // Classic 35mm photography
  '4:3',       // Standard display
  '16:9',      // Widescreen HD
  '16:10',     // Widescreen display
  '21:9',      // Ultra-wide cinematic
  '2.39:1',    // Anamorphic widescreen (decimal format is supported)
];
