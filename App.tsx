
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { 
  Activity, Calendar, Users, Bell, Search, Settings, LogOut, Home, 
  Stethoscope, Clock, ChevronLeft, ChevronRight, Check, MapPin, Phone, Mail, 
  Heart, Sparkles, X, Plus, UserPlus, Lock, Globe, MessageSquare, Filter, MoreVertical, ArrowLeft, Star, ShieldCheck, Award, ThumbsUp
} from 'lucide-react';
import PatientHistoryTimeline from './components/PatientHistoryTimeline';
import ConsultationForm from './app/dashboard/consultation/ConsultationForm';
import AIAssistantPanel from './components/AIAssistantPanel';
import { MOCK_APPOINTMENTS, MOCK_PATIENTS, MOCK_USERS, getPatientDetails, getPatientHistory, fetchStats, saveMedicalRecord, bookAppointment, createPatient } from './services/mockData';
import { Appointment, Patient, MedicalRecord, AppointmentStatus, Role, User } from './types';

// --- CONTEXT MOCK ---
const AuthContext = React.createContext<{ user: User | null; login: (role: Role) => void; logout: () => void }>({
  user: null, login: () => {}, logout: () => {}
});

// --- COMPONENTS ---

const AddPatientModal = ({ isOpen, onClose, onRefresh }: { isOpen: boolean; onClose: () => void; onRefresh: () => void }) => {
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'ذكر', phone: '', chronic: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPatient({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodType: 'Unknown',
        chronicDiseases: formData.chronic ? formData.chronic.split(',') : [],
        allergies: []
    });
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">إضافة مريض جديد</h3>
          <button onClick={onClose}><X className="text-slate-400 hover:text-red-500"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">الاسم بالكامل</label>
            <input required className="w-full p-3 bg-slate-50 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">السن</label>
                <input required type="number" className="w-full p-3 bg-slate-50 border rounded-lg" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">النوع</label>
                <select className="w-full p-3 bg-slate-50 border rounded-lg" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف</label>
            <input className="w-full p-3 bg-slate-50 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
           <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">أمراض مزمنة (افصل بفاصلة)</label>
            <input className="w-full p-3 bg-slate-50 border rounded-lg" placeholder="مثال: سكر, ضغط" value={formData.chronic} onChange={e => setFormData({...formData, chronic: e.target.value})} />
          </div>
          <button type="submit" className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 mt-4">حفظ البيانات</button>
        </form>
      </div>
    </div>
  )
}

const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    visitType: '',
    date: '',
    time: '',
    name: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({ visitType: '', date: '', time: '', name: '', email: '', notes: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '16:00', '16:30'];
  const visitTypes = [
    { id: 'General', label: 'كشف عادي', desc: 'فحص شامل وعام', icon: Stethoscope },
    { id: 'Follow-up', label: 'إعادة / استشارة', desc: 'متابعة كشف سابق', icon: Clock },
    { id: 'Emergency', label: 'حالة طارئة', desc: 'ألم شديد أو حالة حرجة', icon: Activity },
  ];

  const handleBook = async () => {
    setIsLoading(true);
    try {
      await bookAppointment({
        name: formData.name,
        email: formData.email,
        date: formData.date,
        time: formData.time,
        doctorId: 'u1',
        type: formData.visitType
      });
      setStep(4); 
    } catch (e) {
      alert("حصل خطأ، حاول تاني.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-800">حجز موعد مع د. محمد</h3>
            <p className="text-xs text-slate-500">خطوة {step} من 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"><X size={20}/></button>
        </div>
        
        <div className="w-full bg-slate-100 h-1">
          <div className="h-full bg-primary-600 transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-semibold text-slate-800 mb-4">سبب الزيارة؟</h4>
              <div className="space-y-3">
                {visitTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({...formData, visitType: type.id})}
                    className={`w-full p-4 rounded-xl border text-right transition-all flex items-center gap-4 hover:shadow-md
                      ${formData.visitType === type.id 
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' 
                        : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-slate-600'}`}
                  >
                    <div className={`p-2.5 rounded-full ${formData.visitType === type.id ? 'bg-primary-200 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                      <type.icon size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">{type.label}</span>
                      <span className="text-xs opacity-70">{type.desc}</span>
                    </div>
                    {formData.visitType === type.id && <Check className="mr-auto" size={18}/>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">اختار اليوم والساعة</h4>
                <div className="grid grid-cols-1 gap-4">
                  <input 
                    type="date" 
                    className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                  <div className="relative">
                    <select 
                      className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full appearance-none bg-white"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    >
                      <option value="">اختار الميعاد المناسب</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-xl font-semibold text-slate-800 mb-2">بياناتك الشخصية</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">الاسم بالكامل</label>
                  <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="الاسم" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">البريد الإلكتروني</label>
                  <input type="email" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="example@mail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Check className="w-12 h-12" /></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">تم الحجز بنجاح!</h3>
              <p className="text-slate-600 max-w-xs mx-auto mb-8 leading-relaxed">
                ميعادك مع الدكتور يوم <br/>
                <span className="font-bold text-slate-800">{formData.date} الساعة {formData.time}</span>.
              </p>
              <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">تمام</button>
            </div>
          )}
        </div>
        
        {step < 4 && (
          <div className="p-4 border-t border-slate-100 flex justify-between bg-slate-50">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className={`px-6 py-2 font-medium rounded-lg transition ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}>رجوع</button>
            <button onClick={() => step === 3 ? handleBook() : setStep(step + 1)} disabled={(step === 1 && !formData.visitType) || (step === 2 && (!formData.date || !formData.time)) || (step === 3 && (!formData.name || !formData.email)) || isLoading} className="px-8 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-xl disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2 transition-all transform active:scale-95">
              {isLoading ? 'جاري الحجز...' : (step === 3 ? 'تأكيد الحجز' : 'التالي')}
              {!isLoading && step !== 3 && <ChevronLeft size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PAGES ---

const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);

  const refreshList = () => {
      setPatients([...MOCK_PATIENTS]); // Create new ref to trigger render
  }

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <AddPatientModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onRefresh={refreshList} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">سجل المرضى</h1>
          <p className="text-slate-500">إدارة ملفات المرضى والبحث في السجلات</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition">
          <UserPlus size={18} /> إضافة مريض جديد
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ابحث باسم المريض..." 
              className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">اسم المريض</th>
              <th className="px-6 py-4">السن / النوع</th>
              <th className="px-6 py-4">فصيلة الدم</th>
              <th className="px-6 py-4">أمراض مزمنة</th>
              <th className="px-6 py-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{patient.name}</p>
                      <p className="text-xs text-slate-400">ID: {patient.id.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{patient.age} سنة <span className="text-slate-300 mx-1">|</span> {patient.gender}</td>
                <td className="px-6 py-4 text-sm text-slate-600"><span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-100">{patient.bloodType || '-'}</span></td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="flex flex-wrap gap-1">
                    {patient.chronicDiseases.length > 0 ? patient.chronicDiseases.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100">{d}</span>
                    )) : <span className="text-slate-400 italic text-xs">لا يوجد</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user?.role === Role.DOCTOR ? (
                     <button 
                       onClick={() => navigate(`/dashboard/consultation/${patient.id}`)}
                       className="text-primary-600 hover:text-primary-800 font-bold text-sm hover:underline"
                     >
                       فتح الملف الطبي
                     </button>
                  ) : (
                     <span className="text-slate-400 text-sm cursor-not-allowed">لا يوجد صلاحية</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const hours = Array.from({ length: 9 }, (_, i) => i + 9); 

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">جدول المواعيد</h1>
          <p className="text-slate-500">إدارة اليوم وترتيب الحجوزات</p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-80 shrink-0">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-primary-600"/> اختر التاريخ</h3>
             <input 
              type="date" 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-600"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
           </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
          <h3 className="font-bold text-lg text-slate-800 mb-6 pb-4 border-b border-slate-100">الجدول الزمني</h3>
          <div className="space-y-4">
             {hours.map(hour => {
                const timeStr = `${hour < 10 ? '0' + hour : hour}:00`;
                const appt = MOCK_APPOINTMENTS.find(a => a.time.startsWith(timeStr.split(':')[0])); 
                
                return (
                  <div key={hour} className="flex gap-4 group">
                     <div className="w-16 text-left text-sm font-bold text-slate-400 pt-2">{hour}:00</div>
                     <div className="flex-1 relative border-r-2 border-slate-100 pr-6 pb-6 last:pb-0">
                        <div className="absolute -right-[5px] top-2.5 w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-primary-400 transition"></div>
                        
                        {appt ? (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                            <div>
                               <h4 className="font-bold text-slate-800">{appt.patientName}</h4>
                               <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                   ${appt.type === 'Emergency' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                   {appt.type}
                                 </span>
                                 {appt.status}
                               </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-12 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-300 text-sm hover:border-slate-300 hover:text-slate-500 transition cursor-pointer">
                            متاح للحجز
                          </div>
                        )}
                     </div>
                  </div>
                )
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">الإعدادات</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center py-12 text-slate-400">
        <Lock size={48} className="mx-auto mb-4 opacity-20" />
        <p>صفحة الإعدادات متاحة للدكتور فقط (نسخة تجريبية).</p>
      </div>
    </div>
  );
}

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/dashboard');
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
           <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Activity size={32} />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">تسجيل الدخول</h2>
           <p className="text-slate-500 mb-8 text-sm">مرحباً بك في نظام ميديكور لإدارة العيادات</p>
           
           <div className="space-y-3">
             <button onClick={() => handleLogin(Role.DOCTOR)} className="w-full py-4 border border-slate-200 hover:border-primary-500 hover:bg-primary-50 rounded-xl flex items-center justify-center gap-3 font-bold text-slate-700 transition group">
               <Stethoscope className="text-slate-400 group-hover:text-primary-600" />
               دكتور (مدير النظام)
             </button>
             <button onClick={() => handleLogin(Role.RECEPTIONIST)} className="w-full py-4 border border-slate-200 hover:border-primary-500 hover:bg-primary-50 rounded-xl flex items-center justify-center gap-3 font-bold text-slate-700 transition group">
               <Users className="text-slate-400 group-hover:text-primary-600" />
               سكرتارية / استقبال
             </button>
           </div>
           <button onClick={() => setShowLogin(false)} className="mt-8 text-sm text-slate-400 hover:text-slate-600">الرجوع للرئيسية</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900" dir="rtl">
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-2 rounded-xl shadow-lg shadow-primary-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-800'}`}>عيادة <span className="text-primary-600">د. محمد بكري</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-primary-600 transition">الرئيسية</a>
            <a href="#about" className="hover:text-primary-600 transition">من نحن</a>
            <a href="#services" className="hover:text-primary-600 transition">الخدمات</a>
            <a href="#testimonials" className="hover:text-primary-600 transition">قالوا عنا</a>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setShowLogin(true)} className={`hidden sm:flex text-sm font-bold transition ${scrolled ? 'text-slate-500 hover:text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}>دخول الموظفين</button>
             <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition shadow-lg shadow-slate-900/10 transform hover:-translate-y-0.5">احجز موعدك</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden bg-gradient-to-b from-primary-50/50 to-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl opacity-70 animate-pulse delay-700"></div>
            <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-right relative z-10 animate-in slide-in-from-right-10 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-primary-700 text-xs font-bold border border-primary-100 shadow-sm">
              <Sparkles size={14} /> عيادتك المتكاملة لصحة أفضل
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.2] tracking-tight">
              صحتك أمانة، <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary-600 to-indigo-600">ود. محمد بكري قد الأمانة.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              نقدم لك رعاية طبية شاملة بأحدث الأجهزة، وتشخيص دقيق، ومتابعة مستمرة عشان نطمن عليك وعلى أسرتك.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                احجز كشف الآن <ArrowLeft size={18} />
              </button>
              <button onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 bg-white border border-slate-200 hover:border-primary-200 text-slate-700 font-bold rounded-2xl transition shadow-sm hover:shadow-md">
                تعرف على خدماتنا
              </button>
            </div>
            
            <div className="pt-8 flex items-center gap-8 justify-center lg:justify-start opacity-80">
                <div>
                    <p className="text-3xl font-bold text-slate-900">20+</p>
                    <p className="text-xs text-slate-500 font-bold uppercase">سنة خبرة</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                    <p className="text-3xl font-bold text-slate-900">15k+</p>
                    <p className="text-xs text-slate-500 font-bold uppercase">مريض سعيد</p>
                </div>
                 <div className="w-px h-10 bg-slate-200"></div>
                <div>
                    <p className="text-3xl font-bold text-slate-900">4.9</p>
                    <p className="text-xs text-slate-500 font-bold uppercase">تقييم عام</p>
                </div>
            </div>
          </div>

          <div className="relative animate-in slide-in-from-left-10 duration-1000 delay-200">
             <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white transform lg:rotate-2 hover:rotate-0 transition duration-700 group">
               <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800" className="w-full h-auto object-cover group-hover:scale-105 transition duration-1000" alt="Dr. Mohamed Bakry" />
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-8 pt-32 text-white text-right">
                 <p className="font-bold text-2xl">د. محمد بكري</p>
                 <p className="text-slate-200 text-sm opacity-90">استشاري الباطنة والقلب - القصر العيني</p>
               </div>
             </div>
             {/* Floating Cards */}
             <div className="absolute top-10 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce duration-[4000ms] hidden lg:block">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2.5 rounded-full text-red-600"><Heart size={20} fill="currentColor" /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">نبضات القلب</p>
                        <p className="text-lg font-bold text-slate-800">72 BPM <span className="text-xs font-normal text-slate-400">طبيعي</span></p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                  <h2 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-3">خدماتنا الطبية</h2>
                  <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">رعاية طبية شاملة تليق بك</h3>
                  <p className="text-slate-500 leading-relaxed">في عيادة د. محمد بكري، بنقدملك مجموعة متكاملة من الخدمات الطبية عشان نضمن دقة التشخيص وسرعة العلاج.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                      { icon: Stethoscope, title: 'كشف باطنة عامة', desc: 'تشخيص وعلاج دقيق لجميع أمراض الباطنة والجهاز الهضمي.' },
                      { icon: Activity, title: 'متابعة أمراض القلب', desc: 'رسم قلب وايكو بأحدث الأجهزة لمتابعة الضغط وكفاءة القلب.' },
                      { icon: ShieldCheck, title: 'الأمراض المزمنة', desc: 'برامج متخصصة لمتابعة مرضى السكر والضغط والكوليسترول.' },
                      { icon: Sparkles, title: 'فحص شامل', desc: 'باقات الفحص الدوري للاطمئنان على صحتك وصحة أسرتك.' }
                  ].map((service, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 group">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm mb-6 group-hover:bg-primary-600 group-hover:text-white transition">
                              <service.icon size={28} />
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h4>
                          <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
           <div className="flex flex-col lg:flex-row gap-16 items-center">
             <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-primary-600 rounded-3xl rotate-3 opacity-10"></div>
                <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800" className="rounded-3xl shadow-2xl w-full h-[500px] object-cover relative rotate-0 lg:-rotate-3 transition hover:rotate-0 duration-500" alt="Doctor Consultation" />
             </div>
             <div className="lg:w-1/2 space-y-8 text-right">
               <div>
                   <h2 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-3">عن دكتور محمد</h2>
                   <h3 className="text-4xl font-black text-slate-900 mb-6">ليه تختار د. محمد بكري؟</h3>
               </div>
               <p className="text-lg text-slate-600 leading-relaxed">
                 بخبرة أكتر من 20 سنة في طب الباطنة والقلب، د. محمد بيتميز بأسلوب علمي حديث ومتابعة دقيقة لكل تفصيلة في حالة المريض. احنا بنؤمن ان العلاج بيبدأ من الاستماع الجيد للمريض وفهم حالته النفسية قبل الجسدية.
               </p>
               
               <ul className="space-y-4">
                   {[
                       'استشاري الباطنة والقلب - كلية الطب القصر العيني.',
                       'عضو الجمعية الأوروبية لأمراض القلب.',
                       'خبرة واسعة في علاج الحالات الحرجة والمزمنة.',
                       'عيادة مجهزة بأحدث أجهزة التشخيص.'
                   ].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                           <div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={14} strokeWidth={3} /></div>
                           {item}
                       </li>
                   ))}
               </ul>

               <div className="pt-6">
                   <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">
                       احجز موعد للكشف
                   </button>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-3">آراء المرضى</h2>
                  <h3 className="text-3xl lg:text-4xl font-black text-slate-900">قصص نجاح وشفاء</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      { name: 'أحمد عبد العزيز', text: 'دكتور محترم جداً وبيسمع للمريض كويس، والتشخيص كان ممتاز من أول زيارة. ربنا يباركلك يا دكتور.', date: 'منذ أسبوع' },
                      { name: 'مدام سناء', text: 'العيادة نظيفة جداً والمواعيد مظبوطة. دكتور محمد تابع حالة السكر عندي والحمد لله اتحسنت جداً.', date: 'منذ شهر' },
                      { name: 'كريم حسن', text: 'أنصح أي حد تعبان يروح لدكتور محمد، قمة في الذوق والعلم، ومش بيطلب تحاليل ملهاش لازمة.', date: 'منذ يومين' }
                  ].map((review, idx) => (
                      <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative">
                          <div className="text-yellow-400 flex gap-1 mb-4">
                              {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                          </div>
                          <p className="text-slate-600 leading-relaxed mb-6 font-medium">"{review.text}"</p>
                          <div className="flex items-center gap-3 border-t border-slate-200/60 pt-4">
                              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                  {review.name.charAt(0)}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                                  <p className="text-xs text-slate-400">{review.date}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-6 relative z-10">
              <h2 className="text-3xl lg:text-5xl font-black mb-6">جاهز تطمن على صحتك؟</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                  لا تتردد في حجز موعدك الآن. فريقنا جاهز لاستقبالك وتقديم أفضل رعاية طبية ممكنة.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => setIsModalOpen(true)} className="px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition shadow-xl shadow-primary-900/50 transform hover:-translate-y-1">
                      احجز كشف أونلاين
                  </button>
                  <button className="px-10 py-4 bg-transparent border border-slate-600 hover:bg-slate-800 text-white font-bold rounded-2xl transition">
                      <Phone size={18} className="inline ml-2" /> اتصل بنا: 01000000000
                  </button>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-slate-900 text-right font-sans">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold">عيادة د. محمد بكري</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                عيادة طبية متخصصة في الباطنة والقلب، نسعى لتقديم رعاية صحية متميزة تليق بمرضانا، مع الالتزام بأعلى معايير الجودة والأمانة المهنية.
              </p>
              <div className="flex gap-4">
                  {/* Social Icons Placeholder */}
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition cursor-pointer"><Globe size={14} /></div>
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition cursor-pointer"><Mail size={14} /></div>
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition cursor-pointer"><Phone size={14} /></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">روابط سريعة</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-primary-500 transition">الرئيسية</a></li>
                <li><a href="#about" className="hover:text-primary-500 transition">عن الدكتور</a></li>
                <li><a href="#services" className="hover:text-primary-500 transition">الخدمات</a></li>
                <li><a href="#testimonials" className="hover:text-primary-500 transition">آراء المرضى</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">تواصل معنا</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary-500 shrink-0 mt-0.5" />
                  <span>123 شارع الصحة، ميدان الأطباء، المهندسين، الجيزة</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={20} className="text-primary-500 shrink-0" />
                  <span dir="ltr">+20 100 000 0000</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={20} className="text-primary-500 shrink-0" />
                  <span>يومياً من 2 ظهراً - 10 مساءً<br/><span className="text-xs opacity-60">ما عدا الجمعة</span></span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 text-center text-sm text-slate-600">
            <p>&copy; {new Date().getFullYear()} عيادة د. محمد بكري. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { logout, user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  const navItems = [
    { icon: Home, label: 'نظرة عامة', path: '/dashboard', roles: [Role.DOCTOR, Role.RECEPTIONIST] },
    { icon: Users, label: 'سجل المرضى', path: '/dashboard/patients', roles: [Role.DOCTOR, Role.RECEPTIONIST] },
    { icon: Calendar, label: 'المواعيد', path: '/dashboard/schedule', roles: [Role.DOCTOR, Role.RECEPTIONIST] },
    { icon: Settings, label: 'الإعدادات', path: '/dashboard/settings', roles: [Role.DOCTOR] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-primary-100 selection:text-primary-900" dir="rtl">
      <aside className="w-20 md:w-64 bg-white border-l border-slate-200 flex-shrink-0 flex flex-col justify-between z-30">
        <div>
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
            <div className="bg-primary-600 text-white p-1 rounded ml-3 hidden md:block"><Activity className="w-5 h-5" /></div>
            <span className="font-bold text-xl hidden md:block text-slate-800">ميديكور</span>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.filter(item => item.roles.includes(user?.role || Role.DOCTOR)).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className="font-medium hidden md:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
            <LogOut className="w-5 h-5" />
            <span className="font-medium hidden md:block">خروج</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-700">لوحة التحكم</h2>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm border border-primary-200">
                  {user?.role === Role.DOCTOR ? 'د.م' : 'أ.ع'}
              </div>
              <div className="text-right hidden sm:block">
                  <span className="text-sm font-bold text-slate-700 block">{user?.name}</span>
                  <span className="text-xs text-slate-500 block">{user?.role === Role.DOCTOR ? 'طبيب' : 'استقبال'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50/50 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState({ todayAppointments: 0, pendingRequest: 0, completedToday: 0 });
  const [queue, setQueue] = useState<Appointment[]>([]);
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    fetchStats().then(setStats);
    setQueue(MOCK_APPOINTMENTS); 
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">صباح الخير، {user?.name}</h1>
        <p className="text-slate-500">ملخص سريع للي بيحصل في العيادة النهاردة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Calendar className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">مواعيد النهاردة</p><p className="text-3xl font-bold text-slate-800">{stats.todayAppointments}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
           <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-6 h-6" /></div>
           <div><p className="text-sm font-medium text-slate-500">قيد الانتظار</p><p className="text-3xl font-bold text-slate-800">{stats.pendingRequest}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
           <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Check className="w-6 h-6" /></div>
           <div><p className="text-sm font-medium text-slate-500">تم الكشف</p><p className="text-3xl font-bold text-slate-800">{stats.completedToday}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">طابور الانتظار</h3>
          <button className="text-sm text-primary-600 font-bold hover:underline">عرض الجدول بالكامل</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">الميعاد</th>
                <th className="px-6 py-4">المريض</th>
                <th className="px-6 py-4">نوع الكشف</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50 transition group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{appt.time}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold">{appt.patientName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${appt.type === 'Emergency' ? 'bg-red-50 text-red-600 border border-red-100' : appt.type === 'Follow-up' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>{appt.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${appt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${appt.status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>{appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user?.role === Role.DOCTOR && (
                      <button onClick={() => navigate(`/dashboard/consultation/${appt.patientId}`)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-primary-600 hover:text-white hover:border-primary-600 text-sm font-bold rounded-lg transition shadow-sm group-hover:shadow-md">ابدا الكشف</button>
                    )}
                    {user?.role === Role.RECEPTIONIST && (
                       <span className="text-slate-400 text-sm italic">انتظار الطبيب</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ConsultationPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSymptoms, setCurrentSymptoms] = useState('');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [autoFillData, setAutoFillData] = useState<any>(null);
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    // Security check: Only doctors
    if (user && user.role !== Role.DOCTOR) {
        navigate('/dashboard');
        return;
    }
    if (patientId) {
      Promise.all([getPatientDetails(patientId), getPatientHistory(patientId)])
        .then(([p, h]) => { if (p) setPatient(p); setHistory(h); })
        .finally(() => setLoading(false));
    }
  }, [patientId, user]);

  const handleSaveRecord = async (data: any) => {
    if (patient) {
      await saveMedicalRecord({
        patientId: patient.id, doctorId: 'u1', visitDate: new Date().toISOString().split('T')[0], ...data, attachments: []
      });
      alert("تم حفظ الكشف بنجاح!");
      navigate('/dashboard');
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400">جاري تحميل البيانات...</div>;
  if (!patient) return <div className="p-8 text-center">المريض غير موجود</div>;

  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"><ChevronRight size={20} /></button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{patient.name.charAt(0)}</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{patient.name}</h1>
              <div className="flex gap-3 text-xs font-medium text-slate-500"><span>{patient.age} سنة، {patient.gender}</span><span className="text-slate-300">|</span><span>فصيلة: {patient.bloodType || '?'}</span></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            {patient.allergies.length > 0 && <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-100">تحذير حساسية</div>}
            <button onClick={() => setIsAIOpen(!isAIOpen)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition shadow-sm ${isAIOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
              <Sparkles size={14} /> المساعد الذكي {isAIOpen ? 'مفعل' : 'مغلق'}
            </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        {isAIOpen && (
          <div className="w-[30%] h-full relative"> 
              {/* Placeholder for layout, AI Panel is absolute in current impl but lets structure it better if needed, kept absolute for overlay feel */}
          </div>
        )}
        <div className={`flex-1 overflow-y-auto p-8 bg-white scrollbar-thin transition-all duration-300 relative`}>
          <ConsultationForm patient={patient} onSave={handleSaveRecord} onSymptomsChange={setCurrentSymptoms} externalData={autoFillData} />
        </div>
         <div className={`hidden lg:block bg-slate-50/80 border-r border-slate-200 overflow-y-auto p-6 scrollbar-thin transition-all duration-300 w-[30%]`}>
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50/80 backdrop-blur py-2 z-10">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /><h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ المرضي</h3></div>
          </div>
          <PatientHistoryTimeline records={history} />
        </div>
        {isAIOpen && (
          <AIAssistantPanel 
            patient={patient} 
            currentSymptoms={currentSymptoms} 
            isOpen={isAIOpen} 
            onClose={() => setIsAIOpen(false)} 
            onApplyToForm={setAutoFillData}
          />
        )}
      </div>
    </div>
  );
};

const App = () => {
  // Simple Auth State Mock
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    if (role === Role.DOCTOR) setUser(MOCK_USERS[0]);
    if (role === Role.RECEPTIONIST) setUser(MOCK_USERS[1]);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
        <Router>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={user ? <DashboardLayout><DashboardHome /></DashboardLayout> : <Navigate to="/" />} />
            <Route path="/dashboard/consultation/:patientId" element={user ? <DashboardLayout><ConsultationPage /></DashboardLayout> : <Navigate to="/" />} />
            <Route path="/dashboard/patients" element={user ? <DashboardLayout><PatientsPage /></DashboardLayout> : <Navigate to="/" />} />
            <Route path="/dashboard/schedule" element={user ? <DashboardLayout><SchedulePage /></DashboardLayout> : <Navigate to="/" />} />
            <Route path="/dashboard/settings" element={user ? <DashboardLayout><SettingsPage /></DashboardLayout> : <Navigate to="/" />} />
        </Routes>
        </Router>
    </AuthContext.Provider>
  );
};

export default App;
