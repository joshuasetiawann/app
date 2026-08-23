import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { TRIPS } from '../data/mockData';

export default function TripsPage() {
  const { toast } = useAppState();
  const twoCol = useTwoColTemplate();
  const upcoming = TRIPS.find((t) => t.upcoming);
  const past = TRIPS.filter((t) => !t.upcoming);

  return (
    <ScrollColumn>
      {upcoming && (
        <div style={pcss('border-radius:26px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={{ height: 170, background: 'repeating-linear-gradient(135deg,#E4EAF5 0 10px,#EFF3F9 10px 20px)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
            <div style={pcss("position:absolute;top:14px;left:16px;background:#fff;border-radius:100px;padding:5px 11px;font:800 9.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>MENDATANG · 12 HARI</div>
            <div>
              <div style={pcss("font:700 21px 'Quicksand',sans-serif;color:#3A3A48")}>{upcoming.title}</div>
              <div style={pcss("font:600 11px 'Nunito',sans-serif;color:#6B6B7A;margin-top:3px")}>{upcoming.meta}</div>
            </div>
          </div>
          <div style={{ padding: '16px 17px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
              <div>
                <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>PENERBANGAN</div>
                <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{upcoming.flightCode}</div>
              </div>
              <div>
                <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>BERANGKAT</div>
                <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{upcoming.departLabel}</div>
              </div>
              <div>
                <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>MENDARAT</div>
                <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{upcoming.arriveLabel}</div>
              </div>
              <div>
                <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>BERKAS</div>
                <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>4 file</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--ln,rgba(74,74,74,.08))', margin: '14px 0' }} />
            <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-bottom:11px")}>Itinerary</div>
            {upcoming.itinerary?.map((d) => (
              <div key={d.day + d.title} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
                <div style={{ width: 42, flex: 'none', textAlign: 'center', background: 'var(--sf2,#FFF4F1)', borderRadius: 12, padding: '6px 0' }}>
                  <div style={pcss("font:800 13px 'Quicksand',sans-serif;color:var(--pki,#E86F87)")}>{d.day}</div>
                  <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>JUN</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{d.title}</div>
                  <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{d.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);padding-top:2px")}>Trip yang sudah lewat</div>
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        {past.map((t) => (
          <div key={t.id} style={pcss('border-radius:22px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer')} onClick={() => toast(t.title)} role="button">
            <div style={{ height: 110, background: t.coverGradient }} />
            <div style={{ padding: '13px 15px' }}>
              <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{t.title}</div>
              <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{t.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </ScrollColumn>
  );
}
