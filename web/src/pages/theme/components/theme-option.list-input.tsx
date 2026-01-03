import { ListInput, ListItem, Range, Toggle } from 'konsta/react';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../../store';
import Customize from '../database/customize';
import { ThemeOption, getConverter } from '../types/theme-option';
import { debounce } from '../../../utils/debounce';

const ThemeOptionListInput = (props: ThemeOption) => {
  const { t } = useTranslation();
  const { selectedThemeName, rerenderOptions, darkMode, setRerenderOptions } = useStore();
  const [value, setValue] = useState(Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default);

  // Translate description if it's a translation key
  const translatedDescription = useMemo(() => {
    if (props.description && props.description.startsWith('theme.option.')) {
      return t(props.description);
    }
    return props.description;
  }, [props.description, t]);

  // Create a debounced function to save to localStorage and trigger re-render
  const debouncedSaveAndRerender = useMemo(
    () =>
      debounce((themeName: string, optionId: string, newValue: string | number | boolean) => {
        Customize.set(themeName, optionId, newValue);
        setRerenderOptions();
      }, 300),
    [setRerenderOptions]
  );

  useEffect(() => {
    setValue(Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThemeName, rerenderOptions]);

  return (
    <>
      {props.type === 'number' && (
        <ListInput
          key={props.id}
          name={props.id}
          title={props.id}
          info={translatedDescription}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
          }}
        />
      )}

      {props.type === 'string' && (
        <ListInput
          key={props.id}
          name={props.id}
          title={props.id}
          info={translatedDescription}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
          }}
        />
      )}

      {props.type === 'color' && (
        <ListInput
          info={translatedDescription}
          key={props.id}
          name={props.id}
          title={props.id}
          media={
            <div className="relative w-7 h-7">
              <div className="w-full h-full rounded cursor-pointer" style={{ backgroundColor: value as string, outline: `1px solid ${darkMode ? '#fff' : '#000'}` }} />
              <input
                type="color"
                value={value as string}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setValue(newValue);
                  debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          }
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
          }}
        />
      )}

      {props.type === 'select' && (
        <ListInput
          key={props.id}
          name={props.id}
          title={props.id}
          info={translatedDescription}
          value={value}
          type="select"
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
          }}
          dropdown
        >
          {props.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </ListInput>
      )}

      {props.type === 'range-slider' && (
        <ListItem
          key={props.id}
          title={props.id}
          innerChildren={
            <div className="flex space-x-4 rtl:space-x-reverse">
              <span>{value}</span>
              <Range
                value={value}
                min={props.min}
                max={props.max}
                step={props.step}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setValue(newValue);
                  debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
                }}
              />
            </div>
          }
        />
      )}

      {props.type === 'boolean' && (
        <ListItem
          key={props.id}
          title={props.id}
          footer={translatedDescription}
          after={
            <Toggle
              key={props.id}
              checked={value as boolean}
              onChange={() => {
                const newValue = !value;
                setValue(newValue);
                // Boolean toggles are immediate and don't need debouncing
                Customize.set(selectedThemeName, props.id, newValue);
                setRerenderOptions();
              }}
            />
          }
        />
      )}
    </>
  );
};

export default ThemeOptionListInput;
