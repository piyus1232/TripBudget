import React from 'react';

export default React.forwardRef(function Input({
  label,
  type = "text",
  className = '',
  name,
  placeholder,
  error,
  rightSlot,
  ...props
}, ref) {

  const hasCustomBg = className.includes('bg-');
  const hasCustomText = className.includes('text-');
  const hasCustomBorder = className.includes('border');

  const defaultSurface =
    hasCustomBg || hasCustomBorder
      ? ''
      : error
        ? 'bg-slate-900/70 border border-red-500/70 ring-1 ring-red-500/20'
        : 'bg-slate-900/70 border border-slate-600/50';
  const defaultText = hasCustomText ? '' : 'text-slate-100 placeholder:text-slate-500';

  const errText = typeof error === 'string' ? error : error?.message;

  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          name={name}
          id={name}
          ref={ref}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full px-4 py-3 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 ${rightSlot ? 'pr-14' : ''} ${defaultSurface} ${defaultText} ${className}`}
          {...props}
        />
        {rightSlot}
      </div>
      {errText && (
        <p className="text-red-400 text-xs mt-1.5">{errText}</p>
      )}
    </div>
  );
});
