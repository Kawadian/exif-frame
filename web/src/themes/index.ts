import { create } from 'zustand';
import { ONE_LINE_FUNC, ONE_LINE_OPTIONS } from './03_ONE_LINE';
import { THREE_LINE_FUNC, THREE_LINE_OPTIONS } from './04_THREE_LINE';
import { JUST_FRAME_FUNC, JUST_FRAME_OPTIONS } from './02_JUST_FRAME';
import { STRAP_FUNC, STRAP_OPTIONS } from './08_STRAP';
import { FILM_FUNC, FILM_OPTIONS } from './09_FILM';
import { LIGHTROOM_FUNC, LIGHTROOM_OPTIONS } from './11_LIGHTROOM';
import { CUSTOM_ONE_LINE_FUNC, CUSTOM_ONE_LINE_OPTIONS } from './12_CUSTOM_ONE_LINE';
import { CUSTOM_TWO_LINE_FUNC, CUSTOM_TWO_LINE_OPTIONS } from './13_CUSTOM_TWO_LINE';
import { POSTER_FUNC, POSTER_OPTIONS } from './15_POSTER';
import { CINEMASCOPE_FUNC, CINEMASCOPE_OPTIONS } from './16_CINEMASCOPE';
import { SOCIAL_EDITORIAL_FUNC, SOCIAL_EDITORIAL_OPTIONS, SOCIAL_GALLERY_FUNC, SOCIAL_GALLERY_OPTIONS, SOCIAL_REEL_FUNC, SOCIAL_REEL_OPTIONS } from './18_SOCIAL_EDITORIAL';

type AcceptInputType = string | number | boolean;

type ThemeStore = {
  option: Map<string, AcceptInputType>;
  setOption: (key: string, value: AcceptInputType) => void;
  clearOption: () => void;
};

const useThemeStore = create<ThemeStore>((set) => ({
  option: localStorage.getItem('option') ? new Map(JSON.parse(localStorage.getItem('option') as string)) : new Map(),
  setOption: (key, value) => {
    set((state) => {
      state.option.set(key, value);
      localStorage.setItem('option', JSON.stringify(Array.from(state.option.entries())));
      return state;
    });
  },
  clearOption: () => {
    set((state) => {
      state.option.clear();
      localStorage.removeItem('option');
      return state;
    });
  },
}));

const themes = [
  { name: 'Just frame', func: JUST_FRAME_FUNC, options: JUST_FRAME_OPTIONS },
  { name: 'Strap', func: STRAP_FUNC, options: STRAP_OPTIONS },
  { name: 'One line', func: ONE_LINE_FUNC, options: ONE_LINE_OPTIONS },
  { name: 'Three line', func: THREE_LINE_FUNC, options: THREE_LINE_OPTIONS },
  { name: 'Film', func: FILM_FUNC, options: FILM_OPTIONS },
  { name: 'Lightroom', func: LIGHTROOM_FUNC, options: LIGHTROOM_OPTIONS },
  { name: 'Custom One Line', func: CUSTOM_ONE_LINE_FUNC, options: CUSTOM_ONE_LINE_OPTIONS },
  { name: 'Custom Two Line', func: CUSTOM_TWO_LINE_FUNC, options: CUSTOM_TWO_LINE_OPTIONS },
  { name: 'Poster', func: POSTER_FUNC, options: POSTER_OPTIONS },
  { name: 'Cinema Scope', func: CINEMASCOPE_FUNC, options: CINEMASCOPE_OPTIONS },
  { name: 'Social Gallery', func: SOCIAL_GALLERY_FUNC, options: SOCIAL_GALLERY_OPTIONS },
  { name: 'Reel Cover', func: SOCIAL_REEL_FUNC, options: SOCIAL_REEL_OPTIONS },
  { name: 'Editorial Logo', func: SOCIAL_EDITORIAL_FUNC, options: SOCIAL_EDITORIAL_OPTIONS },
];

export default themes;
export { useThemeStore };
