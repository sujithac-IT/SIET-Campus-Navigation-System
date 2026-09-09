'use client';

import React, { useState } from 'react';
import { QRPositionProvider, QRPayload } from '@/lib/location/positionProvider';
import { globalState } from '@/lib/store/useCampusStore';
import { QrCode, Camera, CheckCircle2, MapPin, X, Sparkles, Building2, ShieldCheck } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CHECKPOINTS: QRPayload[] = [
  {
    type: 'campus_position_checkpoint',
    campusId: 'campus_siet_01',
    buildingId: 'b-gate',
    floorId: 0,
    nodeId: 'n-gate-main',
    roomCode: 'SEC-01',
    coordinates: { x: 15, y: 88 },
    version: 1
  },
  {
    type: 'campus_position_checkpoint',
    campusId: 'campus_siet_01',
    buildingId: 'b-library',
    floorId: 2,
    nodeId: 'n-lib-f2-lh25',
    roomCode: 'LH25',
    coordinates: { x: 35, y: 55 },
    version: 1
  },
  {
    type: 'campus_position_checkpoint',
    campusId: 'campus_siet_01',
    buildingId: 'b-library',
    floorId: 2,
    nodeId: 'n-lib-f2-lh26',
    roomCode: 'LH26',
    coordinates: { x: 35, y: 56 },
    version: 1
  },
  {
    type: 'campus_position_checkpoint',
    campusId: 'campus_siet_01',
    buildingId: 'b-academic',
    floorId: 0,
    nodeId: 'n-acad-g-lh01',
    roomCode: 'LH01',
    coordinates: { x: 30, y: 45 },
    version: 1
  },
  {
    type: 'campus_position_checkpoint',
    campusId: 'campus_siet_01',
    buildingId: 'b-techpark',
    floorId: 1,
    nodeId: 'n-tech-f1-incubation',
    roomCode: 'TECH-101',
    coordinates: { x: 75, y: 25 },
    version: 1
  }
];

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'simulate' | 'qr_code'>('simulate');
  const [selectedQR, setSelectedQR] = useState<QRPayload>(SAMPLE_CHECKPOINTS[1]); // LH25 default

  if (!isOpen) return null;

  const handleScanCheckpoint = (checkpoint: QRPayload) => {
    setIsSimulating(true);
    const qrProvider = new QRPositionProvider();
    const payloadString = JSON.stringify(checkpoint);
    const posState = qrProvider.parseAndScan(payloadString);

    if (posState) {
      // Update global user location state
      globalState.updateUserCoordinates(globalState.currentUser?.id || 'guest', posState.coordinates);
      globalState.selectBuilding(posState.buildingId || null);
      if (posState.floor !== undefined) {
        globalState.setFloor(posState.floor);
      }

      setScannedResult(
        `Checkpoint Verified! Located at ${checkpoint.roomCode || 'Building Node'} (${posState.buildingId}, Floor ${posState.floor})`
      );

      // Trigger notification
      globalState.addNotification({
        roleTarget: 'all',
        title: '📍 QR Location Recalibrated',
        message: `Position updated to ${checkpoint.roomCode || 'Checkpoint'} (Floor ${posState.floor}) via QR Scan.`,
        type: 'info'
      });
    }

    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0d1526] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                QR Positioning Checkpoint
              </h2>
              <p className="text-xs text-slate-400">Scan entrance & corridor QR checkpoints for instant indoor recalibration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('simulate')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
              activeTab === 'simulate'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Instant Simulation Checkpoints
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all ${
              activeTab === 'scan'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📷 Live Camera Scanner
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {scannedResult && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{scannedResult}</span>
            </div>
          )}

          {activeTab === 'simulate' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Click any campus checkpoint below to test indoor positioning without a physical camera:
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {SAMPLE_CHECKPOINTS.map((cp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleScanCheckpoint(cp)}
                    disabled={isSimulating}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {cp.roomCode || 'Entrance Checkpoint'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Building: <span className="text-slate-300">{cp.buildingId}</span> • Floor: {cp.floorId}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20">
                      Scan Checkpoint
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-cyan-500/30 rounded-2xl bg-slate-950/60 text-center space-y-4">
              <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 animate-pulse">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Point Camera at Campus QR Code</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Camera scanning active. Point your phone at any pillar or door checkpoint QR label.
                </p>
              </div>
              <button
                onClick={() => handleScanCheckpoint(SAMPLE_CHECKPOINTS[1])}
                className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition-colors"
              >
                Simulate Camera Capture (LH25)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            100% Privacy Preserved • Public Checkpoints Only
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
