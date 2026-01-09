
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, User, Sparkles, X, Loader2, Activity, ArrowRight, Globe, AlertCircle } from 'lucide-react';
import { Patient } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  structuredData?: any;
  groundingMetadata?: any;
}

interface AIAssistantPanelProps {
  patient: Patient;
  currentSymptoms: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyToForm: (data: any) => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ patient, currentSymptoms, isOpen, onClose, onApplyToForm }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: `أهلاً د. محمد. جاهز للمساعدة في حالة **${patient.name}**. هات الأعراض أو التشخيص المقترح عشان أراجع الجرعات والتعارضات.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const renderFormattedText = (text: string) => {
    // Simple markdown bold parser
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !process.env.API_KEY) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // TOKEN SAVING STRATEGY:
      // 1. Only send the System Instruction + Patient Context + Last 6 messages.
      // This prevents the context window from exploding in long sessions.
      const recentHistory = messages.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const systemContext = `
        [ROLE]
        مساعد إكلينيكي (Clinical CDSS) للدكتور محمد بكري.
        
        [PATIENT CONTEXT]
        Name: ${patient.name} | Age: ${patient.age} | Gender: ${patient.gender}
        Chronic: ${patient.chronicDiseases.join(', ') || 'None'}
        Allergy: ${patient.allergies.join(', ') || 'None'}
        Current Complaint: "${currentSymptoms}"

        [STRICT RULES FOR EFFICIENCY & INTELLIGENCE]
        1. **كن مختصراً جداً (Be Extremely Concise):** ممنوع المقدمات (أهلاً، شكراً، أتمنى الشفاء). ادخل في المعلومة الطبية فوراً.
        2. **اللهجة:** مصري علمي (Egyptian Arabic mixed with standard English medical terms).
        3. **التفكير (Clinical Reasoning):**
           - لو طلبت تشخيص: قدم أهم 3 احتمالات (Differential Diagnosis) بالنسب المئوية، ثم التوصية.
           - لو طلبت علاج: اكتب اسم الدواء، الجرعة، والمدة فوراً.
        4. **التنسيق:** استخدم (**Bold**) للأدوية والتشخيصات. استخدم قوائم (-) للنقاط.
        5. **الـ JSON:** لو السؤال يتطلب "روشتة" أو "حفظ للحالة"، لازم تنهي الرد بـ JSON Block مخفي عشان نملى الفورم أوتوماتيك.

        [OUTPUT JSON FORMAT - IF APPLICABLE]
        [[JSON_START]]
        {
          "diagnosis": "Short Diagnosis",
          "treatmentPlan": "Bullet points plan",
          "prescription": [
            { "name": "Generic Name", "dosage": "500mg", "frequency": "1x3", "duration": "5 days" }
          ]
        }
        [[JSON_END]]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Fast and efficient
        contents: [
          { role: 'user', parts: [{ text: systemContext }] }, // Instructions as first message
          ...recentHistory,
          { role: 'user', parts: [{ text: text }] } // Current Query
        ],
        config: {
          tools: [{ googleSearch: {} }], // Only searches if strictly needed
          temperature: 0.3, // Low temperature = More deterministic/medical, less creative/hallucinations
          maxOutputTokens: 300, // Force brevity (approx 150-200 words max)
        }
      });

      let responseText = response.text || "مشكلة في الاتصال.";
      let extractedData = null;
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      // Extract Hidden JSON
      const jsonMatch = responseText.match(/\[\[JSON_START\]\]([\s\S]*?)\[\[JSON_END\]\]/);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[1]);
          // Remove JSON from visible text to keep UI clean
          responseText = responseText.replace(jsonMatch[0], '').trim();
        } catch (e) {
          console.error("Failed to parse AI JSON", e);
        }
      }

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText,
        structuredData: extractedData,
        groundingMetadata: groundingMetadata
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "فشل الاتصال. حاول تاني." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-[400px] bg-white border-r border-slate-200 h-full flex flex-col shadow-2xl absolute left-0 top-0 z-40 animate-in slide-in-from-left duration-300 font-sans text-right">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-900 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30 backdrop-blur-sm">
            <Sparkles size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">المساعد الطبي الذكي</h3>
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Globe size={10} /> متصل (Gemini 2.5 Flash)
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={18}/></button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm mt-1 ${msg.role === 'user' ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-emerald-400'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[85%] space-y-2 text-right`}>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-white border border-slate-200 text-slate-700 rounded-tr-none' : 'bg-white border border-emerald-100 text-slate-800 rounded-tl-none'}`}>
                {renderFormattedText(msg.text)}
                
                {/* Grounding Sources */}
                {msg.groundingMetadata?.groundingChunks && (
                   <div className="mt-3 pt-3 border-t border-slate-100">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Globe size={10}/> مصادر خارجية</p>
                     <div className="flex flex-wrap gap-2">
                       {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => (
                         chunk.web?.uri && (
                           <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-blue-600 hover:underline truncate max-w-full block hover:bg-blue-50 transition">
                             {chunk.web.title || 'مصدر ' + (idx + 1)}
                           </a>
                         )
                       ))}
                     </div>
                   </div>
                )}
              </div>

              {/* Action Card */}
              {msg.structuredData && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1"><Activity size={12}/> أمر تشغيل (Action)</span>
                  </div>
                  <div className="text-xs text-slate-600 mb-3 bg-white/60 p-2 rounded-lg text-right border border-emerald-100/50" dir="rtl">
                    <div className="flex justify-between mb-1"><span>التشخيص:</span> <span className="font-bold">{msg.structuredData.diagnosis}</span></div>
                    <div className="flex justify-between"><span>الأدوية:</span> <span className="font-bold">{msg.structuredData.prescription?.length || 0} أصناف</span></div>
                  </div>
                  <button 
                    onClick={() => onApplyToForm(msg.structuredData)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                  >
                    تطبيق في الروشتة <ArrowRight size={12} className="rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-sm border border-slate-800">
              <Loader2 size={14} className="animate-spin text-emerald-400" />
            </div>
            <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-75"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب الأعراض، أو اسأل عن دواء..."
            className="w-full pr-4 pl-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent outline-none transition text-right font-medium text-slate-700 placeholder:text-slate-400"
            dir="rtl"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition shadow-md"
          >
            <Send size={14} className="rotate-180"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
