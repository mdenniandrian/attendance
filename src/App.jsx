import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  Heart,
  Lock
} from 'lucide-react';

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Mei 2026

  const employees = [
    { id: 0, name: 'Lukman', startOffIdx: 0, initShift: 0 },      // Rabu, Malam
    { id: 1, name: 'Rafi', startOffIdx: 1, initShift: 1 },        // Kamis, Siang
    { id: 2, name: 'Rizky', startOffIdx: 2, initShift: 2 },       // Jumat, Pagi
    { id: 3, name: 'Bagus', startOffIdx: 3, initShift: 0 },       // Sabtu, Malam
    { id: 4, name: 'Coming Soon', startOffIdx: 4, initShift: 1 }, // Minggu, Siang
  ];

  const shiftTypes = [
    { id: 'M', name: 'Malam', time: '22.00-07.00', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'S', name: 'Siang', time: '14.00-23.00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'P', name: 'Pagi', time: '06.00-15.00', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'L', name: 'LIBUR', time: 'OFF', color: 'bg-red-100 text-red-600 border-red-200 font-bold' },
  ];

  const allowedOffDays = [3, 4, 5, 6, 0]; // Rabu s/d Minggu
  const anchorDate = new Date(2026, 3, 27); // Senin, 27 April 2026
  anchorDate.setHours(0,0,0,0);

  const mod = (n, m) => ((n % m) + m) % m;

  const getSchedule = (emp, targetDate) => {
    const d = new Date(targetDate);
    d.setHours(0,0,0,0);

    let offTaken = 0;
    let isOffToday = false;
    let iter = new Date(anchorDate);

    while (iter <= d) {
      const diffWeeks = Math.floor((iter.getTime() - anchorDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const currentOffDay = allowedOffDays[mod(emp.startOffIdx + diffWeeks, 5)];

      if (iter.getDay() === currentOffDay) {
        if (iter.getTime() === d.getTime()) isOffToday = true;
        else offTaken++;
      }
      iter.setDate(iter.getDate() + 1);
    }

    if (isOffToday) return 'L';
    const cycle = ['M', 'S', 'P'];
    return cycle[mod(emp.initShift + offTaken, 3)];
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < emptyDays; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
              <CalendarIcon className="text-blue-600" size={32} /> Jadwal Tim 2026
            </h1>
            <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock size={14} className="text-amber-500" /> Kunci Shift Pasca-Libur • Alur M-S-P
            </p>
          </div>
          <div className="flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={24} /></button>
            <span className="px-8 font-black text-lg min-w-[220px] text-center text-blue-900 uppercase tracking-widest italic">{currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight size={24} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center text-xs">
          <div className="bg-white p-4 rounded-3xl shadow-sm border-t-4 border-purple-500 font-bold uppercase"><RefreshCw className="mx-auto mb-1 text-purple-500" size={18}/> Malam → Siang → Pagi</div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border-t-4 border-blue-600 font-bold uppercase"><Zap className="mx-auto mb-1 text-blue-500" size={18}/> Senin-Selasa 2-2-1</div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border-t-4 border-emerald-500 font-bold uppercase"><Heart className="mx-auto mb-1 text-emerald-500" size={18}/> Rehat Setelah Libur</div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-5">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => <div key={d} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => (
              <div key={idx} className={`min-h-[180px] border-b border-r border-slate-100 p-2 hover:bg-slate-50/50 ${!date ? 'bg-slate-50/50' : ''}`}>
                {date && (
                  <>
                    <div className="mb-3 text-xs font-black text-slate-400 p-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {employees.map(emp => {
                        const shift = getSchedule(emp, date);
                        const info = shiftTypes.find(s => s.id === shift) || shiftTypes[3];
                        return (
                          <div key={emp.id} className={`text-[10px] px-2 py-1.5 rounded-xl border flex justify-between font-bold ${info.color}`}>
                            <span>{emp.name.split(' ')[0]}</span><span>{shift}</span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Zap = ({size, className}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;

export default App;
