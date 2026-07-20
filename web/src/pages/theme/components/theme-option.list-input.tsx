import { ListInput, ListItem, Range, Toggle } from 'konsta/react';
import { useEffect, useState, useMemo, useRef, ChangeEvent } from 'react';
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

const isPartialNumberInput = (raw: string, allowDecimal: boolean) => {
  if (raw === '' || raw === '-') {
    return true;
  }
  if (allowDecimal && (raw === '.' || raw === '-.')) {
    return true;
  }
  return allowDecimal ? /^-?\d*\.?\d*$/.test(raw) : /^-?\d*$/.test(raw);
};

const ThemeOptionListInput = (props: ThemeOption) => {
  const { t } = useTranslation();
  const { selectedThemeName, rerenderOptions, darkMode, setRerenderOptions } = useStore();
  const [value, setValue] = useState(Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default);
  const [draft, setDraft] = useState(() => String(Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default));
  const isEditingRef = useRef(false);

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
    if (isEditingRef.current) {
      return;
    }
    const next = Customize.get(selectedThemeName, props.id, getConverter(props.type)) ?? props.default;
    setValue(next);
    if (props.type === 'number' || props.type === 'range-slider') {
      setDraft(String(next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThemeName, rerenderOptions]);

  const saveNumericValue = (newValue: number, syncDraft = true) => {
    setValue(newValue);
    if (syncDraft && !isEditingRef.current) {
      setDraft(String(newValue));
    }
    debouncedSaveAndRerender(selectedThemeName, props.id, newValue);
  };

  const commitNumericDraft = (min: number, max: number, defaultValue: number) => {
    isEditingRef.current = false;
    const parsed = Number(draft);
    const next = draft === '' || draft === '-' || draft === '.' || draft === '-.' || Number.isNaN(parsed) ? defaultValue : Math.min(max, Math.max(min, parsed));
    setDraft(String(next));
    setValue(next);
    debouncedSaveAndRerender.cancel();
    Customize.set(selectedThemeName, props.id, next);
    setRerenderOptions();
  };

  const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>, step: number) => {
    const raw = e.target.value;
    const allowDecimal = step < 1;
    if (!isPartialNumberInput(raw, allowDecimal)) {
      return;
    }

    setDraft(raw);

    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
      debouncedSaveAndRerender.cancel();
      return;
    }

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      return;
    }

    // Update preview while typing, but never clamp or autofill mid-edit.
    setValue(parsed);
    debouncedSaveAndRerender(selectedThemeName, props.id, parsed);
  };

  const renderNumericControl = (min: number, max: number, step: number) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    const sliderValue = Number.isFinite(numericValue) ? Math.min(max, Math.max(min, numericValue)) : min;
    const defaultValue = props.type === 'number' || props.type === 'range-slider' ? props.default : 0;

    return (
      <div className="flex w-full min-w-0 flex-col gap-2 py-0.5">
        <span className="leading-tight">{optionTitle}</span>
        <div className="flex w-full min-w-0 items-center gap-3">
          <input
            type="text"
            inputMode={step < 1 ? 'decimal' : 'numeric'}
            name={props.id}
            value={draft}
            className="w-16 shrink-0 rounded-md border border-black/15 bg-transparent px-2 py-1 text-sm tabular-nums dark:border-white/20"
            onFocus={() => {
              isEditingRef.current = true;
              setDraft(String(value));
            }}
            onChange={(e) => handleNumberInputChange(e, step)}
            onBlur={() => commitNumericDraft(min, max, defaultValue)}
          />
          <div className="min-w-0 flex-1">
            <Range
              value={sliderValue}
              min={min}
              max={max}
              step={step}
              className="w-full"
              onChange={(e) => {
                isEditingRef.current = false;
                const next = Number(e.target.value);
                setDraft(String(next));
                saveNumericValue(next);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (props.type === 'number') {
    const { min, max, step } = getNumberSliderBounds(props, Number(value) || 0);
    return (
      <ListItem
        key={props.id}
        title={renderNumericControl(min, max, step)}
        titleWrapClassName="w-full [&>div]:w-full [&>div]:min-w-0 [&>div]:flex-1"
      />
    );
  }

  if (props.type === 'range-slider') {
    return (
      <ListItem
        key={props.id}
        title={renderNumericControl(props.min, props.max, props.step)}
        titleWrapClassName="w-full [&>div]:w-full [&>div]:min-w-0 [&>div]:flex-1"
      />
    );
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
