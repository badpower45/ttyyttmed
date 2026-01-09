
import React from 'react';
import { MedicalRecord } from '../types';
import { Calendar, MoreHorizontal } from 'lucide-react';

interface PatientHistoryTimelineProps {
  records: MedicalRecord[];
  isLoading?: boolean;
}

const PatientHistoryTimeline: React.FC<PatientHistoryTimelineProps> = ({ records, isLoading }) => {
  if (isLoading) {
    return <div className="space-y-4 p-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"/>)}</div>;
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-sm">لا يوجد تاريخ مرضي سابق.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {records.map((record) => (
        <div key={record.id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{record.visitDate}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  د. محمد بكري <span className="w-1 h-1 rounded-full bg-slate-300"/> كشف عام
                </p>
              </div>
            </div>
            <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={20}/></button>
          </div>

          <div className="pr-[3.25rem]">
             <div className="mb-3">
               <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md mb-2">
                 الـتـشـخـيـص
               </span>
               <p className="text-slate-700 font-medium text-sm leading-relaxed">{record.diagnosis}</p>
             </div>

             {record.prescription.length > 0 && (
               <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                 {record.prescription.map((med, idx) => (
                   <div key={idx} className="text-xs text-slate-600 flex justify-between border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                      <span className="font-semibold">{med.name}</span>
                      <span className="text-slate-400">{med.dosage}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientHistoryTimeline;