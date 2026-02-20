import React from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    style?: React.CSSProperties;
    modules?: any;
    theme?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = (props) => {
    return (
        <textarea
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            style={{
                width: '100%',
                minHeight: '150px',
                background: 'transparent',
                color: '#e4e4e7',
                border: 'none',
                padding: '16px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical' as const,
                outline: 'none',
                ...props.style
            }}
            placeholder={props.placeholder || 'Enter your message here...'}
            readOnly={props.readOnly}
        />
    );
};

export default RichTextEditor;
