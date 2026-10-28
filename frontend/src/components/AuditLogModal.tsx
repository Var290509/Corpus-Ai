import React from 'react';
import { X, Activity, User, Bot, CheckCircle } from 'lucide-react';
import { AuditRunLog } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditRunLog[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in text-left">
      <div 
        className="w-full max-w-2xl glass-panel-elevated rounded-2xl border border-[#D4C4E2] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#D4C4E2] flex items-center justify-between bg-white/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E1945] flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#201035]">Provenance & Audit Run Log</h3>
              <p className="text-[11px] text-[#7E7A72]">
                Chronological log of version edits, automated algorithms, and human reviewer decisions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E7A72] hover:text-[#201035]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5 font-mono text-xs">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="p-3 rounded-xl bg-white border border-[#FAF5FF] space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-[#7E7A72]">{log.timestamp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#D4C4E2] text-[#2B1544] font-bold">
                    V{log.versionNumber} • {log.step}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 ${
                  log.actor === 'human' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                }`}>
                  {log.actor === 'human' ? <User className="w-3 h-3 mr-0.5" /> : <Bot className="w-3 h-3 mr-0.5" />}
                  <span>{log.actor}</span>
                </span>
              </div>

              <div className="font-semibold text-[#201035] text-xs">
                {log.action}
              </div>

              <p className="text-[11px] text-[#5F5C56]">
                {log.details}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white/70 border-t border-[#D4C4E2] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#2E1945] text-white"
          >
            Close Log
          </button>
        </div>
      </div>
    </div>
  );
};
