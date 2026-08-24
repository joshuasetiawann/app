import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { EmptyState } from '../components/shared/Atoms';
import { QuickCreatePanel } from '../components/shared/QuickCreatePanel';

export default function TripsPage() {
  const navigate = useNavigate();
  const { setGalleryFilter, trips, addTrip, toast } = useAppState();
  const [creating, setCreating] = useState(false);
  const twoCol = useTwoColTemplate();
  const upcoming = trips.find((trip) => trip.upcoming);
  const past = trips.filter((trip) => !trip.upcoming);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScrollColumn>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setCreating((value) => !value)} aria-expanded={creating} style={pcss("padding:9px 14px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--pki,#E86F87);cursor:pointer;font:800 10.5px 'Nunito',sans-serif")}>+ Rencanakan trip</button>
      </div>

      {creating && (
        <QuickCreatePanel
          title="Rencanakan perjalanan"
          description="Detail dasar ini dibagikan ke pasangan; dokumen perjalanan tetap dapat disimpan di menu Berkas."
          submitLabel="Simpan perjalanan ✈️"
          fields={[
            { name: 'title', label: 'Nama perjalanan', placeholder: 'Ketemu di Bali', required: true, wide: true },
            { name: 'startsOn', label: 'Mulai', type: 'date', min: today },
            { name: 'endsOn', label: 'Selesai', type: 'date', min: today },
            { name: 'flightCode', label: 'Kode penerbangan', placeholder: 'GA-412' },
            { name: 'departLabel', label: 'Berangkat dari', placeholder: 'CGK · 08:30' },
            { name: 'arriveLabel', label: 'Tiba di', placeholder: 'DPS · 11:20' },
          ]}
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            addTrip({ title: values.title, startsOn: values.startsOn || '', endsOn: values.endsOn || '', flightCode: values.flightCode || '', departLabel: values.departLabel || '', arriveLabel: values.arriveLabel || '' });
            setCreating(false);
            toast('Perjalanan tersimpan untuk kalian ✈️');
          }}
        />
      )}

      {trips.length === 0 && !creating && <EmptyState tag="RENCANA BERDUA" emoji="🧳" title="Belum ada perjalanan" body="Buat rencana pertama; tanggal dan detail penerbangan akan muncul di kedua akun." actionLabel="Rencanakan perjalanan" onAction={() => setCreating(true)} />}

      {upcoming && (
        <div style={pcss('border-radius:26px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={{ height: 170, background: upcoming.coverGradient, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
            <div style={pcss("position:absolute;top:14px;left:16px;background:#fff;border-radius:100px;padding:5px 11px;font:800 9.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>MENDATANG</div>
            <div><div style={pcss("font:700 21px 'Quicksand',sans-serif;color:#3A3A48")}>{upcoming.title}</div><div style={pcss("font:600 11px 'Nunito',sans-serif;color:#6B6B7A;margin-top:3px")}>{upcoming.meta}</div></div>
          </div>
          <div style={{ padding: '16px 17px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 12 }}>
              {[['PENERBANGAN', upcoming.flightCode], ['BERANGKAT', upcoming.departLabel], ['MENDARAT', upcoming.arriveLabel]].map(([label, value]) => <div key={label}><div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{label}</div><div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{value}</div></div>)}
              <div><div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>BERKAS</div><button type="button" onClick={() => navigate('/files')} style={pcss("border:0;background:transparent;padding:3px 0;font:700 12px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}>Lihat berkas ›</button></div>
            </div>
            {upcoming.itinerary?.length ? (
              <><div style={{ height: 1, background: 'var(--ln,rgba(74,74,74,.08))', margin: '14px 0' }} /><div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-bottom:11px")}>Itinerary</div>{upcoming.itinerary.map((item) => <div key={item.day + item.title} style={{ display: 'flex', gap: 12, padding: '8px 0' }}><div style={{ width: 42, flex: 'none', textAlign: 'center', background: 'var(--sf2,#FFF4F1)', borderRadius: 12, padding: '6px 0' }}><div style={pcss("font:800 11px 'Quicksand',sans-serif;color:var(--pki,#E86F87)")}>{item.day}</div></div><div style={{ flex: 1 }}><div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{item.title}</div><div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{item.meta}</div></div></div>)}</>
            ) : null}
          </div>
        </div>
      )}

      {past.length > 0 && <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);padding-top:2px")}>Trip yang sudah lewat</div>}
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        {past.map((trip) => <button type="button" key={trip.id} aria-label={`Lihat galeri ${trip.title}`} onClick={() => { setGalleryFilter('Travel'); navigate('/gallery'); }} style={pcss('width:100%;border:0;text-align:left;color:inherit;padding:0;border-radius:22px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer')}><div style={{ height: 110, background: trip.coverGradient }} /><div style={{ padding: '13px 15px' }}><div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{trip.title}</div><div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{trip.meta}</div></div></button>)}
      </div>
    </ScrollColumn>
  );
}
