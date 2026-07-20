import { ListInput, ListItem, Range, Toggle } from 'konsta/react';
import { useEffect, useState, useMemo, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../../store';
import Customize from '../database/customize';
import { ThemeOption, getConverter } from '../types/theme-option';
import { debounce } from '../../../utils/debounce';

const getNumberSliderBounds = (props: Extract<ThemeOption, { type: 'number' }>, currentValue: number) => {
  const allowNegative = props.id.includes('OFFSET') || props.default < 0 || currentValue < 0;
  const min = props.min ?? (allowNegative ? -Math.max(Math.abs(props.default) * 5, 200) : 0);
  const max = props.max ?? Math.max(Math.abs(props.default) * 5, Math.abs(currentValue), 200);
  const step = props.step ?? 1;
  return { min, max, step };
};

const ThemeOptionListInput = (props: ThemeOption) => {
  const { t } = useTranslation();
  const { selectedThemeName, rerenderOptions, darkMode, setRerenderOptions } = useStore();
  const [value, setValue] = useState(Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default);

  const optionTitle = useMemo(() => {
    if (props.description && props.description.startsWith('theme.option.')) {
      return t(props.description);
    }
    if (props.description) {
      return props.description;
    }
    return props.id;
  }, [props.description, props.id, t]);

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

  const saveNumericValue = (newValue: number) => {
    setValue(newValue);
    debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
  };

  const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>, step: number) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') {
      setValue(raw);
      return;
    }
    const parsed = step < 1 ? Number(raw) : Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    saveNumericValue(parsed);
  };

  const renderNumericControl = (min: number, max: number, step: number) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    const sliderValue = Number.isFinite(numericValue) ? Math.min(max, Math.max(min, numericValue)) : min;
    const defaultValue = props.type === 'number' || props.type === 'range-slider' ? props.default : 0;

    return (
      <div className="flex w-full min-w-0 flex-col gap-2 py-0.5">
        <span className="leading-tight">{optionTitle}</span>
        <div className="flex min-w-0 items-center gap-3">
          <input
            type="number"
            name={props.id}
            value={value as string | number}
            min={min}
            max={max}
            step={step}
            className="w-16 shrink-0 rounded-md border border-black/15 bg-transparent px-2 py-1 text-sm tabular-nums dark:border-white/20"
            onChange={(e) => handleNumberInputChange(e, step)}
            onBlur={() => {
              if (value === '' || value === '-' || Number.isNaN(Number(value))) {
                saveNumericValue(defaultValue);
              }
            }}
          />
          <Range
            value={sliderValue}
            min={min}
            max={max}
            step={step}
            className="flex-1"
            onChange={(e) => {
              saveNumericValue(Number(e.target.value));
            }}
          />
        </div>
      </div>
    );
  };

  if (props.type === 'number') {
    const { min, max, step } = getNumberSliderBounds(props, Number(value) || 0);
    return <ListItem key={props.id} title={renderNumericControl(min, max, step)} titleWrapClassName="w-full" />;
  }

  if (props.type === 'range-slider') {
    return <ListItem key={props.id} title={renderNumericControl(props.min, props.max, props.step)} titleWrapClassName="w-full" />;
  }

  return (
    <>
      {props.type === 'string' && (
        <ListInput
          key={props.id}
          name={props.id}
          title={optionTitle}
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
          key={props.id}
          name={props.id}
          title={optionTitle}
          media={
            <div className="relative h-7 w-7">
              <div className="h-full w-full cursor-pointer rounded" style={{ backgroundColor: value as string, outline: `1px solid ${darkMode ? '#fff' : '#000'}` }} />
              <input
                type="color"
                value={value as string}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setValue(newValue);
                  debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
          title={optionTitle}
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

      {props.type === 'boolean' && (
        <ListItem
          key={props.id}
          title={optionTitle}
          after={
            <Toggle
              key={props.id}
              checked={value as boolean}
              onChange={() => {
                const newValue = !value;
                setValue(newValue);
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
