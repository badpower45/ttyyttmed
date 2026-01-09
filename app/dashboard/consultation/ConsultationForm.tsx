
import React, { useState, useEffect, useRef } from 'react';
import { Medicine, Patient } from '../../../types';
import { Plus, Save, Thermometer, Activity, Heart, X, Tablet, Sparkles, Trash2, Search } from 'lucide-react';
import { EGYPTIAN_MEDICINES } from '../../../constants';

interface ConsultationFormProps {
  patient: Patient;
  onSave: (data: any) => void;
  onSymptomsChange: (symptoms: string) => void;
  externalData?: {
    diagnosis?: string;
    treatmentPlan?: string;
    prescription?: Medicine[];
  } | null;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ patient, onSave, onSymptomsChange, externalData }) => {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  // Detailed Medicine State
  const [newMed, setNewMed] = useState({ 
    name: '', 
    dosage: '', 
    frequency: '', 
    duration: '' 
  });
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  const [lastAutoFill, setLastAutoFill] = useState<number>(0);

  useEffect(() => {
    onSymptomsChange(chiefComplaint);
  }, [chiefComplaint, onSymptomsChange]);

  useEffect(() => {
    if (externalData) {
      if (externalData.diagnosis) setDiagnosis(externalData.diagnosis);
      if (externalData.treatmentPlan) setNotes(externalData.treatmentPlan);
      if (externalData.prescription && externalData.prescription.length > 0) {
        setMedicines(prev => [...prev, ...externalData.prescription!]);
      }
      setLastAutoFill(Date.now());
    }
  }, [externalData]);

  // Handle outside clicks to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMedNameChange = (val: string) => {
    setNewMed({ ...newMed, name: val });
    if (val.length > 1) {
      const filtered = EGYPTIAN_MEDICINES.filter(m => 
        m.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8); // Limit suggestions to 8 for UI cleanliness
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setNewMed({ ...newMed, name });
    setShowSuggestions(false);
  };

  const addMedicine = () => {
    if (!newMed.name) return;
    setMedicines([...medicines, { 
      name: newMed.name, 
      dosage: newMed.dosage || '-', 
      frequency: newMed.frequency || '-', 
      duration: newMed.duration || '-' 
    }]);
    setNewMed({ name: '', dosage: '', frequency: '', duration: '' });
    setShowSuggestions(false);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      chiefComplaint,
      diagnosis,
      treatmentPlan: notes,
      notes,
      prescription: medicines
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-24 relative" dir="rtl">
      
      <div key={lastAutoFill} className={`absolute inset-0 bg-indigo-500/10 pointer-events-none transition-opacity duration-700 ${Date.now() - lastAutoFill < 1000 ? 'opacity-100' : 'opacity-0'}`} />

      {/* Vitals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="bg-rose-50 p-2 rounded-full text-rose-500"><Thermometer size={20} /></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">الحرارة</p><p className="font-mono font-bold text-slate-700 text-lg">37°C</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-full text-blue-500"><Activity size={20} /></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">الضغط</p><p className="font-mono font-bold text-slate-700 text-lg">120/80</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-full text-emerald-500"><Heart size={20} /></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">النبض</p><p className="font-mono font-bold text-slate-700 text-lg">72 bpm</p></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Assessment */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-primary-500"></div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={16} /> الفحص السريري
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">الشكوى والأعراض</label>
            <textarea 
              required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-100 focus:bg-white focus:border-primary-200 transition resize-none"
              rows={3}
              placeholder="المريض بيشتكي من إيه..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">التشخيص المبدئي</label>
              {externalData?.diagnosis && externalData.diagnosis === diagnosis && (
                 <span className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Sparkles size={12}/> اقتراح الذكاء الاصطناعي</span>
              )}
            </div>
            <input 
              type="text"
              required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-bold text-lg placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-primary-100 focus:bg-white focus:border-primary-200 transition"
              placeholder="مثال: نزلة شعبية حادة"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>
        </div>

        {/* Prescription with Autocomplete */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Tablet size={16} /> الروشتة والعلاج
           </h2>
           
           <div className="grid grid-cols-12 gap-2 mb-4 items-end relative">
             <div className="col-span-4 relative" ref={suggestionRef}>
                <label className="text-[10px] text-slate-400 font-bold mr-1">اسم الدواء</label>
                <div className="relative">
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:bg-white focus:border-emerald-200 transition font-bold"
                    placeholder="Panadol"
                    value={newMed.name}
                    onChange={(e) => handleMedNameChange(e.target.value)}
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          className="w-full text-right px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center justify-between group"
                        >
                          <span className="font-bold">{s}</span>
                          <Search size={12} className="text-slate-300 group-hover:text-emerald-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
             </div>
             <div className="col-span-3">
                <label className="text-[10px] text-slate-400 font-bold mr-1">التركيز</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:bg-white focus:border-emerald-200 transition"
                  placeholder="500mg"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                />
             </div>
             <div className="col-span-2">
                <label className="text-[10px] text-slate-400 font-bold mr-1">التكرار</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:bg-white focus:border-emerald-200 transition"
                  placeholder="3 مرات"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                />
             </div>
             <div className="col-span-2">
                <label className="text-[10px] text-slate-400 font-bold mr-1">المدة</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:bg-white focus:border-emerald-200 transition"
                  placeholder="5 أيام"
                  value={newMed.duration}
                  onChange={(e) => setNewMed({...newMed, duration: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicine())}
                />
             </div>
             <div className="col-span-1">
                <button 
                    type="button"
                    onClick={addMedicine}
                    className="w-full p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center"
                >
                <Plus size={20} />
                </button>
             </div>
           </div>

           <div className="space-y-2 mb-6 min-h-[50px]">
             {medicines.map((med, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-xl group hover:bg-emerald-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm font-bold text-xs border border-emerald-100">Rx</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{med.name} <span className="text-slate-400 font-normal text-xs">({med.dosage})</span></p>
                      <p className="text-xs text-slate-500">{med.frequency} - لمدة {med.duration}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeMedicine(idx)} className="text-slate-300 hover:text-red-500 p-2 transition">
                    <Trash2 size={16} />
                  </button>
               </div>
             ))}
             {medicines.length === 0 && (
                <p className="text-sm text-slate-400 italic pr-2">لم يتم إضافة أدوية حتى الآن.</p>
             )}
           </div>

           <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات إضافية / تعليمات للمريض</label>
           <textarea 
              className="w-full p-4 bg-amber-50/30 border border-amber-100/50 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-amber-100 focus:bg-amber-50/50 transition resize-none"
              rows={4}
              placeholder="متابعة بعد أسبوعين..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 p-2 rounded-2xl shadow-2xl flex items-center gap-2 z-30 pl-4 pr-2">
         <span className="text-xs font-bold text-slate-400 mr-2 hidden sm:block uppercase tracking-wide">غير محفوظ</span>
         <button type="button" className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition">إلغاء</button>
         <button 
          type="submit"
          className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-slate-900/20 flex items-center gap-2 transition transform active:scale-95"
        >
           <Save size={16} /> حفظ الكشف
         </button>
      </div>

    </form>
  );
};

export default ConsultationForm;
