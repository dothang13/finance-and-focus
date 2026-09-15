import React, { useState, useEffect } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { sound } from '../utils/audio';
import { exportAllData, importAllData, INITIAL_TRANSACTIONS, INITIAL_TASKS, INITIAL_STREAK, saveTransactions, saveTasks, saveStreak } from '../utils/storage';
import QRCode from 'qrcode';

export default function SyncModal({ onClose, setTransactions, setTasks, setStreak }) {
  const [qrUrl, setQrUrl] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const gen = async () => {
      try {
        const payload = exportAllData();
        const url = await QRCode.toDataURL(payload.substring(0, 1500), {
          width: 200,
          margin: 1,
          color: { dark: '#09090B', light: '#FAFAFA' }
        });
        setQrUrl(url);
      } catch (err) {
        // ignore
      }
    };
    gen();
  }, []);

  const handleExport = () => {
    sound.playClick();
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zenith_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const ok = importAllData(content);
        if (ok) {
          setStatus('Khôi phục dữ liệu thành công.');
          setTimeout(() => window.location.reload(), 600);
        } else {
          setStatus('File không hợp lệ.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn xoá toàn bộ dữ liệu và bắt đầu lại từ đầu?')) {
      sound.playClick();
      saveTransactions(INITIAL_TRANSACTIONS);
      saveTasks(INITIAL_TASKS);
      saveStreak(INITIAL_STREAK);
      setTransactions(INITIAL_TRANSACTIONS);
      setTasks(INITIAL_TASKS);
      setStreak(INITIAL_STREAK);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#FFFFFF' }}>Đồng bộ & Sao lưu</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Dữ liệu của bạn được lưu cục bộ trong trình duyệt (Offline). Khi sử dụng trên điện thoại, bạn có thể xuất file backup để nhập vào điện thoại hoặc quét mã QR.
        </p>

        {qrUrl && (
          <div style={{ textAlign: 'center', background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>MÃ QR ĐỒNG BỘ DỮ LIỆU</div>
            <img src={qrUrl} alt="Zenith QR" style={{ borderRadius: '8px' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <button onClick={handleExport} className="btn-ghost" style={{ padding: '10px' }}>
            <Download size={14} />
            <span>Tải file backup</span>
          </button>

          <label className="btn-ghost" style={{ padding: '10px', cursor: 'pointer', textAlign: 'center' }}>
            <Upload size={14} />
            <span>Khôi phục file</span>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>

        {status && (
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', textAlign: 'center', marginBottom: '12px' }}>
            {status}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', fontSize: '0.75rem', cursor: 'pointer' }}>
            Xoá toàn bộ dữ liệu (Bắt đầu mới)
          </button>
        </div>

      </div>
    </div>
  );
}
