import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { ScrollColumn } from '../components/shared/ScrollColumn';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ScrollColumn>
      <section style={pcss('min-height:60vh;display:grid;place-items:center;text-align:center;padding:32px')}>
        <div>
          <div aria-hidden="true" style={pcss('font-size:54px;animation:kk-float 3s ease-in-out infinite')}>🗺️</div>
          <div style={pcss("margin-top:16px;font:800 10px 'Nunito',sans-serif;letter-spacing:.14em;color:var(--pki,#E86F87)")}>PAGE NOT FOUND</div>
          <h1 style={pcss("max-width:14ch;margin:9px auto 0;font:700 clamp(28px,5vw,46px)/1.08 'Quicksand',sans-serif;letter-spacing:-.04em;color:var(--ink,#4A4A4A)")}>Sepertinya kita salah belok.</h1>
          <p style={pcss("max-width:44ch;margin:12px auto 0;font:600 14px/1.65 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>This page may have moved. Your story is still safe in the main space.</p>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            style={pcss("min-height:46px;margin-top:22px;padding:0 22px;border:0;border-radius:14px;background:var(--pk,#FFB7B2);color:#5C3A42;font:800 12px 'Nunito',sans-serif;cursor:pointer")}
          >
            Kembali ke beranda
          </button>
        </div>
      </section>
    </ScrollColumn>
  );
}
