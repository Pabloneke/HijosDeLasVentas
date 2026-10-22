import React from 'react';

// Átomo de formulario: etiqueta + control (input, select o textarea) + mensaje de error.
// Recibe por props todo lo demás (value, onChange, type, placeholder...) y lo pasa al control.
const FormField = ({ id, label, error, as: Control = 'input', children, ...rest }) => {
    const claseBase = Control === 'select' ? 'form-select' : 'form-control';

    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label fw-semibold">{label}</label>
            <Control
                id={id}
                className={`${claseBase} ${error ? 'is-invalid' : ''}`.trim()}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                {...rest}
            >
                {children}
            </Control>
            {error && <div id={`${id}-error`} className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default FormField;
