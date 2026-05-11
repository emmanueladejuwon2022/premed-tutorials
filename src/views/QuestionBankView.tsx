import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import {
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  BrainCircuit,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QuestionBankView({ onClose, course }: { onClose: () => void, course: any }) {
  const { token } = useAuth();
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Question Form
  const [showEditor, setShowEditor] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [form, setForm] = useState({
    id: null,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a',
    diagram_url: ''
  });

  const [newTopicName, setNewTopicName] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch(`/api/courses/${course._id}/topics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTopics(Array.isArray(data) ? data : []);
      if (data.length > 0) handleSelectTopic(data[0]);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic: any) => {
    setSelectedTopic(topic);
    try {
      const res = await fetch(`/api/admin/questions/${topic._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      setQuestions([]);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'a',
      diagram_url: ''
    });
    setShowEditor(true);
  };

  const saveQuestion = async () => {
    const isEditing = !!form.id;
    const url = isEditing ? `/api/admin/questions/${form.id}` : `/api/admin/questions`;
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      topic_id: selectedTopic._id,
      course_id: course._id,
      ...form
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (isEditing) {
        setQuestions(questions.map(q => q._id === data._id ? data : q));
      } else {
        setQuestions([...questions, data]);
      }
      setShowEditor(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (q: any) => {
    setForm({
      id: q._id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      diagram_url: q.diagram_url || ''
    });
    setShowEditor(true);
  };

  const handleDelete = async (qId: string) => {
    if (!window.confirm("Delete question?")) return;
    try {
      await fetch(`/api/admin/questions/${qId}/${selectedTopic._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestions(questions.filter(q => q._id !== qId));
    } catch {}
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newTopicName, course_id: course._id })
      });
      const data = await res.json();
      setTopics([...topics, data]);
      setNewTopicName('');
      if (!selectedTopic) handleSelectTopic(data);
    } catch {}
  };

  const handleDeleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this topic and all its questions?")) return;
    try {
      await fetch(`/api/admin/topics/${topicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTopics(topics.filter(t => t._id !== topicId));
      if (selectedTopic?._id === topicId) {
        setSelectedTopic(null);
        setQuestions([]);
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition shrink-0">
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex-1 truncate">
            <h1 className="text-base md:text-lg font-black tracking-tighter dark:text-white truncate">{course.title}</h1>
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Repository</div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
           <button onClick={() => setShowAI(true)} disabled={!selectedTopic} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-3 py-2 rounded-xl font-bold text-[10px] tracking-wide hover:bg-indigo-100 dark:hover:bg-indigo-500/20 disabled:opacity-50 transition-all">
             <BrainCircuit size={14} />
             <span>AI Generator</span>
           </button>
           <button onClick={resetForm} disabled={!selectedTopic} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-xl font-bold text-[10px] tracking-wide hover:opacity-90 disabled:opacity-50 transition-all shadow-md">
             <Plus size={14} />
             <span>Add Manual</span>
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar Topics */}
        <div className="w-full md:w-56 lg:w-64 bg-slate-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 md:h-full max-h-[140px] md:max-h-full">
          <div className="p-3 shrink-0">
            <div className="hidden md:block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Knowledge Threads</div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="New Topic..."
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTopic()}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-2 text-[10px] font-bold dark:text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCreateTopic}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 rounded-lg flex items-center justify-center shrink-0 transition"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 md:overflow-y-auto px-2 md:px-3 pb-3 md:pb-6 flex md:flex-col gap-1.5 overflow-x-auto hide-scrollbar items-center md:items-stretch">
            {topics.map(topic => (
              <div
                key={topic._id}
                onClick={() => handleSelectTopic(topic)}
                className={`group shrink-0 w-auto min-w-[100px] md:w-full text-center md:text-left p-2 md:p-2.5 rounded-lg transition-all cursor-pointer font-bold text-[10px] md:text-xs border flex justify-center md:justify-between items-center ${selectedTopic?._id === topic._id ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm dark:text-white font-black' : 'border-slate-100 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
              >
                <div className="truncate md:flex-1">{topic.name}</div>
                <button
                   onClick={(e) => handleDeleteTopic(topic._id, e)}
                   className="hidden lg:flex opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition ml-2"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-slate-950 relative">
          {!selectedTopic ? (
             <div className="h-full flex items-center justify-center py-10">
               <div className="max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] text-center shadow-sm">
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <BrainCircuit size={24} className="md:w-8 md:h-8" />
                 </div>
                 <h3 className="text-lg md:text-xl font-black dark:text-white mb-2">Create a Thread</h3>
                 <p className="text-slate-500 text-xs md:text-sm mb-6">Create a topic (e.g. "Cardiology Basics") before adding questions.</p>
                 <div className="flex flex-col gap-3">
                   <input
                     type="text"
                     placeholder="e.g. Anatomy 101"
                     value={newTopicName}
                     onChange={(e) => setNewTopicName(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleCreateTopic()}
                     className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl p-3 md:p-4 text-sm font-bold dark:text-white outline-none text-center transition"
                   />
                   <button onClick={handleCreateTopic} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 md:p-4 rounded-xl text-sm font-bold tracking-wide transition shadow-md shadow-blue-500/20">
                     Create Thread
                   </button>
                 </div>
               </div>
             </div>
          ) : (
             <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 pb-20">
               <div className="mb-4 md:mb-6">
                 <h2 className="text-xl md:text-2xl font-black dark:text-white tracking-tight">{selectedTopic.name}</h2>
                 <p className="text-slate-500 text-xs md:text-sm font-medium">{questions.length} questions attached</p>
               </div>

               <AnimatePresence>
                 {questions.map((q, idx) => (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                     key={q._id}
                     className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-sm relative group overflow-hidden"
                   >
                     <div className="absolute top-3 right-3 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(q)} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg hover:text-indigo-600 transition border border-slate-100 dark:border-slate-700"><Edit2 size={12} /></button>
                        <button onClick={() => handleDelete(q._id)} className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-100 transition border border-red-100 dark:border-red-900/10"><Trash2 size={12} /></button>
                     </div>
                     <div className="flex items-start gap-3 mb-4 pr-12 md:pr-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] dark:text-white shrink-0 border border-slate-100 dark:border-slate-700">
                          {idx + 1}
                        </div>
                        <div className="pt-1 text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                          {q.question_text}
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-0 md:pl-10">
                        {['a', 'b', 'c', 'd'].map((opt) => (
                          <div key={opt} className={`px-3 py-2 rounded-lg border transition-all text-xs ${q.correct_option === opt ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-slate-50 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-transparent'}`}>
                             <span className="uppercase mr-2 opacity-50 font-black">{opt}</span>
                             <span className="break-words">{q[`option_${opt}`]}</span>
                          </div>
                        ))}
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Editor Slide Over */}
      <AnimatePresence>
        {showEditor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setShowEditor(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white dark:bg-slate-900 shadow-2xl z-[70] border-l border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
                 <h2 className="text-xl font-black uppercase tracking-widest dark:text-white">Question Editor</h2>
                 <button onClick={() => setShowEditor(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Question Text</label>
                   <textarea rows={4} value={form.question_text} onChange={e => setForm({...form, question_text: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 font-medium dark:text-white outline-none transition" />
                 </div>
                 
                 <div className="space-y-4">
                   <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Options</label>
                   {['a', 'b', 'c', 'd'].map(opt => (
                     <div key={opt} className={`flex items-center gap-3 p-2 rounded-2xl border-2 transition ${form.correct_option === opt ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-800'}`}>
                       <button onClick={() => setForm({...form, correct_option: opt})} className={`w-10 h-10 shrink-0 rounded-xl font-black uppercase flex items-center justify-center transition-colors ${form.correct_option === opt ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                         {opt}
                       </button>
                       <input value={(form as any)[`option_${opt}`]} onChange={e => setForm({...form, [`option_${opt}`]: e.target.value})} className="flex-1 bg-transparent px-2 font-medium outline-none dark:text-white" placeholder={`Option ${opt.toUpperCase()}...`} />
                     </div>
                   ))}
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                 <button onClick={saveQuestion} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold tracking-wide transition shadow-xl shadow-blue-500/20">
                   <Save size={20} /> Save Artifact
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* AI Injector Modal */}
      <AnimatePresence>
        {showAI && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]" 
              onClick={() => setShowAI(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[70] rounded-[1.5rem] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-indigo-50 dark:border-slate-800 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/5">
                 <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                   <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                    <BrainCircuit size={16} />
                   </div>
                   <div>
                    <h2 className="text-sm font-black uppercase tracking-wider">AI Injector</h2>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] -mt-0.5">Smart Engine v2</p>
                   </div>
                 </div>
                 <button onClick={() => setShowAI(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"><X size={18} /></button>
              </div>
              
              <div className="p-4 space-y-4">
                 <div>
                   <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Source Context</label>
                    <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">Syllabus/Notes</span>
                   </div>
                   <textarea 
                     id="ai_syllabus_text" 
                     rows={8} 
                     className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-xs font-medium dark:text-white outline-none transition placeholder-slate-400 resize-none" 
                     placeholder="Paste lecture notes, textbook excerpts or syllabus here..." 
                   />
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <div className="flex-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 px-0.5">Quantity</label>
                    <input 
                      type="number" 
                      id="ai_question_count" 
                      defaultValue="10" 
                      min="1" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs font-bold dark:text-white outline-none"
                      placeholder="e.g. 15"
                    />
                   </div>
                 </div>
              </div>

              <div className="p-4 pt-0">
                 <button 
                   onClick={async (e) => {
                     const btn = e.currentTarget;
                     const text = (document.getElementById('ai_syllabus_text') as HTMLTextAreaElement).value;
                     const count = (document.getElementById('ai_question_count') as HTMLInputElement).value;
                     if (!text) return alert("Please provide source text.");
                     
                     btn.disabled = true;
                     const originalText = btn.innerHTML;
                     btn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</span>';

                     try {
                       const res = await fetch('/api/admin/generate-questions', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                         body: JSON.stringify({ syllabus_text: text, count: parseInt(count) })
                       });
                       const data = await res.json();
                       if (data.success) {
                         const uploadRes = await fetch('/api/admin/bulk-upload', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                           body: JSON.stringify({ questions: data.questions.map((q: any) => ({...q, topic_id: selectedTopic._id, course_id: course._id})) })
                         });
                         await uploadRes.json();
                         handleSelectTopic(selectedTopic);
                         setShowAI(false);
                       } else {
                         alert(data.error || "AI Generation failed.");
                         btn.disabled = false;
                         btn.innerHTML = originalText;
                       }
                     } catch (e: any) {
                       console.error("AI Error:", e);
                       alert("AI Generation failed: " + e.message);
                       btn.disabled = false;
                       btn.innerHTML = originalText;
                     }
                   }} 
                   disabled={!selectedTopic} 
                   className="w-full h-11 flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                 >
                   <BrainCircuit size={16} /> Generate & Inject
                 </button>
                 <p className="text-[9px] text-center text-slate-400 mt-3 font-medium">Powered by Antigravity AI • Context-Aware Generation</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
