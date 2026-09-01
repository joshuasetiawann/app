import { useId, type FormEvent } from 'react';
import { pcss } from '../../lib/pcss';

export interface QuickField {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'datetime-local' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  min?: string;
  max?: string;
  options?: Array<{ label: string; value: string }>;
  wide?: boolean;
}

export function QuickCreatePanel({
  title,
  description,
  fields,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  title: string;
  description: string;
  fields: QuickField[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const formId = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values: Record<string, string> = {};
    for (const [key, value] of new FormData(event.currentTarget).entries()) {
      if (typeof value === 'string') values[key] = value;
    }
    onSubmit(values);
  };

  const inputStyle = pcss("width:100%;min-height:44px;margin-top:6px;padding:10px 12px;border:1px solid var(--ln,rgba(74,74,74,.12));border-radius:13px;outline:none;color:var(--ink,#4A4A4A);background:var(--sf,#fff);font:600 12px 'Nunito',sans-serif");

  return (
    <form onSubmit={submit} style={pcss('padding:17px;border:1px solid var(--ln,rgba(74,74,74,.1));border-radius:22px;background:var(--sf2,#FFF4F1);box-shadow:0 10px 26px rgba(90,65,75,.07);animation:kk-soft-in .28s ease')}>
      <div>
        <strong style={pcss("display:block;color:var(--ink,#4A4A4A);font:800 15px 'Quicksand',sans-serif")}>{title}</strong>
        <span style={pcss("display:block;margin-top:4px;color:var(--mut,#A99A9E);font:600 10.5px/1.5 'Nunito',sans-serif")}>{description}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 15 }}>
        {fields.map((field) => {
          const id = `${formId}-${field.name}`;
          return (
            <label key={field.name} htmlFor={id} style={{ gridColumn: field.wide ? '1 / -1' : undefined, color: 'var(--ink2,#6B5B60)', font: "800 10px 'Nunito',sans-serif" }}>
              {field.label}
              {field.type === 'textarea' ? (
                <textarea id={id} name={field.name} required={field.required} defaultValue={field.defaultValue} placeholder={field.placeholder} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              ) : field.type === 'select' ? (
                <select id={id} name={field.name} required={field.required} defaultValue={field.defaultValue} style={inputStyle}>
                  {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : (
                <input id={id} name={field.name} type={field.type || 'text'} required={field.required} defaultValue={field.defaultValue} placeholder={field.placeholder} min={field.min} max={field.max} style={inputStyle} />
              )}
            </label>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 15 }}>
        <button type="button" onClick={onCancel} style={pcss("min-height:40px;padding:0 14px;border:0;border-radius:12px;color:var(--ink2,#6B5B60);background:var(--sf,#fff);cursor:pointer;font:800 10.5px 'Nunito',sans-serif")}>Cancel</button>
        <button type="submit" style={pcss("min-height:40px;padding:0 16px;border:0;border-radius:12px;color:#5C3A42;background:var(--pk,#FFB7B2);cursor:pointer;box-shadow:0 6px 16px rgba(255,140,150,.2);font:800 10.5px 'Nunito',sans-serif")}>{submitLabel}</button>
      </div>
    </form>
  );
}
