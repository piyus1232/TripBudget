import React from 'react';

export default React.forwardRef(function Input({
  label,
  type = "text",
  className = '',
  name,
  placeholder,
  error,
  ...props
}, ref) {
  return (
    <div className="mb-5 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-white/80 mb-1"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        id={name}
        ref={ref}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/60 backdrop-blur-lg border transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent ${
          error ? 'border-red-500' : 'border-white/20'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message}</p>
      )}
    </div>
  );
});
