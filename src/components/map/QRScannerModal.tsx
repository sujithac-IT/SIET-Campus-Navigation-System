'use client';

import React, { useState } from 'react';
import { useCampusStore } from '@/lib/store/useCampusStore';
import { QrCode, X, CheckCircle2, MapPin, Sparkles, Navigation } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const store = useCampusStore();
  const [selectedQR, setSelectedQR] = useState('SIET-QR-LH25');
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const qrOptions = [
    { id: 'SIET-QR-LH25', label: 'LH-25 Doorway', detail: 'Library Block • Floor 2' },
    { id: 'SIET-QR-LH28', label: 'LH-28 Doorway', detail: 'Library Block • Floor 2' },
    { id: 'SIET-QR-TECHPARK', label: 'Tech Park Lobby', detail: 'Innovation Center • Ground Floor' },
    { id: 'SIET-QR-CANTEEN', label: 'Food Court Entrance', detail: 'Central Canteen Complex' },
    { id: 'SIET-QR-GATE', label: 'Main Security Checkpoint', detail: 'Campus Entrance Gate' }
  ];

  const handleScan = (qrId: string) => {
    const res = store.scanQRCode(qrId);
    setScanSuccess(res.locationName);
    setTimeout(() => {
      setScanSuccess(null);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#0b1329] border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Indoor Location Scanner</h3>
              <p className="text-[11px] text-slate-400">Scan classroom QR code to pinpoint position</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {scanSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-sm font-extrabold text-white">Position Calibrated!</h4>
            <p className="text-xs text-slate-300 font-medium px-4">
              Current Location: <span className="text-emerald-400 font-bold">{scanSuccess}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Viewfinder simulation */}
            <div className="relative w-full h-36 bg-slate-900 border-2 border-dashed border-sky-500/40 rounded-xl flex flex-col items-center justify-center overflow-hidden group">
              <div className="absolute inset-4 border border-sky-400/20 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-sky-400/40 animate-pulse" />
              </div>
              <span className="relative z-10 text-[10px] uppercase tracking-widest font-mono text-sky-300 bg-slate-950/80 px-3 py-1 rounded-full border border-sky-500/30">
                Camera Active • Tap sample code
              </span>
            </div>

            {/* Quick QR choices */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simulate Room QR Tag:
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                {qrOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleScan(opt.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800 transition text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition" />
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-white">{opt.label}</div>
                        <div className="text-[10px] text-slate-400">{opt.detail}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400 opacity-0 group-hover:opacity-100 transition">
                      Scan
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
