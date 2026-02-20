import React, { useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useToast } from '../../../context/ToastContext';
import { Mail, Save, Eye, EyeOff, Copy, Tag, RotateCcw } from 'lucide-react';

const VARIABLES = [
    { key: '{{order_id}}', label: 'Order ID', example: 'ORD-20240220-1234' },
    { key: '{{customer_email}}', label: 'Customer Email', example: 'customer@email.com' },
    { key: '{{product_title}}', label: 'Product Title', example: 'BO6 AFK Bot Lobbies' },
    { key: '{{product_description}}', label: 'Product Description', example: 'Premium bot lobbies for COD.' },
    { key: '{{product_image}}', label: 'Product Image URL', example: 'https://yourstore.com/img.png' },
    { key: '{{price}}', label: 'Order Total', example: '$9.98' },
    { key: '{{payment_method}}', label: 'Payment Method', example: 'Cash App' },
    { key: '{{store_name}}', label: 'Store Name', example: 'Lyphen' },
    { key: '{{store_email}}', label: 'Store Email', example: 'support@lyphen.com' },
    { key: '{{order_date}}', label: 'Order Date', example: 'February 20, 2026' },
];

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Order is Confirmed — {{store_name}}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #07070f; font-family: 'Inter', -apple-system, sans-serif; color: #e4e4e7; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 16px; }
  .card { background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #4f68f8, #6d28d9); padding: 36px 32px; text-align: center; }
  .header h1 { color: #fff; font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; }
  .header p { color: rgba(255,255,255,0.75); font-size: 0.9rem; }
  .body { padding: 32px; }
  .status-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.3); color: #4ade80; padding: 8px 20px; border-radius: 50px; font-size: 0.85rem; font-weight: 700; margin-bottom: 28px; }
  .product-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
  .product-img { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
  .product-info h3 { color: #fff; font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
  .product-info p { color: #a1a1aa; font-size: 0.82rem; line-height: 1.5; }
  .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 24px 0; }
  .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.88rem; }
  .detail-label { color: #71717a; }
  .detail-value { color: #fff; font-weight: 600; }
  .total-row { display: flex; justify-content: space-between; padding: 16px; background: rgba(79,104,248,0.08); border: 1px solid rgba(79,104,248,0.15); border-radius: 10px; margin-top: 8px; }
  .total-label { color: #a1a1aa; font-weight: 600; font-size: 0.9rem; }
  .total-value { color: var(--primary, #818cf8); font-weight: 800; font-size: 1.1rem; }
  .footer { padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
  .footer p { color: #52525b; font-size: 0.78rem; line-height: 1.6; }
  .footer a { color: #818cf8; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
      <p>Thank you for your purchase. Here are your order details.</p>
    </div>
    <div class="body">
      <div class="status-badge">✅ Payment Received</div>
      <div class="product-card">
        <img class="product-img" src="{{product_image}}" alt="{{product_title}}" onerror="this.style.display='none'" />
        <div class="product-info">
          <h3>{{product_title}}</h3>
          <p>{{product_description}}</p>
        </div>
      </div>
      <div class="divider"></div>
      <div class="detail-row"><span class="detail-label">Order ID</span><span class="detail-value">{{order_id}}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">{{order_date}}</span></div>
      <div class="detail-row"><span class="detail-label">Payment</span><span class="detail-value">{{payment_method}}</span></div>
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">{{customer_email}}</span></div>
      <div class="total-row">
        <span class="total-label">Total Paid</span>
        <span class="total-value">{{price}}</span>
      </div>
      <div class="divider"></div>
      <p style="color:#a1a1aa; font-size:0.85rem; line-height:1.6;">
        Your order is being processed. If you have any questions, reply to this email or contact us at
        <a href="mailto:{{store_email}}" style="color:#818cf8;">{{store_email}}</a>.
      </p>
    </div>
    <div class="footer">
      <p>© {{store_name}} · <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</div>
</body>
</html>`;

const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', resize: 'vertical',
};

const SAMPLE_DATA: Record<string, string> = {
    '{{order_id}}': 'ORD-20260220-8472',
    '{{customer_email}}': 'gamer@example.com',
    '{{product_title}}': 'BO6 AFK Bot Lobbies — Bot Lobby (Host)',
    '{{product_description}}': 'Premium bot lobbies for COD Black Ops 6. Safe, fast, 24/7.',
    '{{product_image}}': '/demo-product-1.png',
    '{{price}}': '$9.98',
    '{{payment_method}}': 'Cash App',
    '{{store_name}}': 'Lyphen',
    '{{store_email}}': 'support@lyphen.com',
    '{{order_date}}': 'February 20, 2026',
};

const DeliveryEmail: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const { addToast } = useToast();
    const [template, setTemplate] = useState<string>(() => (settings as any).emailTemplate || DEFAULT_TEMPLATE);
    const [preview, setPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const previewHtml = template.replace(/\{\{(\w+(?:_\w+)*)\}\}/g, (match) => SAMPLE_DATA[match] || match);

    const save = () => {
        setIsSaving(true);
        updateSettings({ emailTemplate: template } as any);
        setTimeout(() => {
            setIsSaving(false);
            addToast('Email template saved!', 'success');
        }, 600);
    };

    const copyVariable = (key: string) => {
        navigator.clipboard.writeText(key);
        addToast(`Copied ${key}`, 'success');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: 'calc(100vh - 80px)' }}>
            {/* Toolbar */}
            <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '16px 24px', marginBottom: 20, flexShrink: 0,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Mail size={20} style={{ color: 'var(--primary-color,#818cf8)' }} /> Delivery Email Template
                    </h1>
                    <p style={{ fontSize: '0.82rem', color: '#71717a', marginTop: 3 }}>Design the email sent to customers after purchase. Use variables like <code style={{ color: '#a78bfa' }}>{'{{product_title}}'}</code></p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => { if (confirm('Reset to default template?')) setTemplate(DEFAULT_TEMPLATE); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#a1a1aa', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <RotateCcw size={13} /> Reset
                    </button>
                    <button onClick={() => setPreview(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: preview ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${preview ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: preview ? '#818cf8' : '#a1a1aa', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {preview ? <EyeOff size={13} /> : <Eye size={13} />} {preview ? 'Edit' : 'Preview'}
                    </button>
                    <button onClick={save} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'linear-gradient(135deg, var(--primary-color,#4f68f8), var(--secondary-color,#6d28d9))', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Save size={13} /> {isSaving ? 'Saving…' : 'Save Template'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
                {/* Variables sidebar */}
                <div style={{ width: 240, flexShrink: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                        <Tag size={13} style={{ color: '#a78bfa' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Variables</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#52525b', marginBottom: 14 }}>Click to copy, then paste into your template.</p>
                    {VARIABLES.map(v => (
                        <div key={v.key} onClick={() => copyVariable(v.key)} style={{
                            marginBottom: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(167,139,250,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <code style={{ fontSize: '0.72rem', color: '#a78bfa', flex: 1 }}>{v.key}</code>
                                <Copy size={10} style={{ color: '#52525b', flexShrink: 0 }} />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: 2 }}>{v.label}</div>
                            <div style={{ fontSize: '0.65rem', color: '#3f3f46', marginTop: 1 }}>{v.example}</div>
                        </div>
                    ))}
                </div>

                {/* Editor / Preview */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {preview ? (
                        <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', fontSize: '0.75rem', color: '#71717a', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Eye size={12} /> Preview with sample data — actual values filled on send
                            </div>
                            <iframe
                                srcDoc={previewHtml}
                                style={{ width: '100%', height: 'calc(100% - 34px)', border: 'none', borderRadius: '0 0 14px 14px', background: '#07070f' }}
                                title="Email Preview"
                            />
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', fontSize: '0.75rem', color: '#71717a', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', borderRadius: '14px 14px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                📝 HTML Editor — use variables from the sidebar
                            </div>
                            <textarea
                                value={template}
                                onChange={e => setTemplate(e.target.value)}
                                style={{ ...inp, flex: 1, minHeight: 0, borderRadius: '0 0 14px 14px', resize: 'none', fontSize: '0.8rem', lineHeight: 1.6, padding: 16 }}
                                spellCheck={false}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryEmail;
