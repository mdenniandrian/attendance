import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Lock, 
  RefreshCw
} from 'lucide-react';

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Mei 2026
  const [today] = useState(new Date());

  // Data Karyawan
  const employees = [
    { id: 0, name: 'Lukman', avatar: 'bg-blue-500' },
    { id: 1, name: 'Rafi', avatar: 'bg-indigo-500' },
    { id: 2, name: 'Rizky', avatar: 'bg-emerald-500' },
    { id: 3, name: 'Bagus', avatar: 'bg-amber-500' },
    { id: 4, name: 'Member', avatar: 'bg-rose-500' },
  ];

  // Konfigurasi Shift Sesuai Permintaan (A: Pagi 1, B: Pagi 2, C: Siang, D: Malam, L: Libur)
  const shiftTypes = {
    'A': { label: 'Pagi 1', time: '06.00 - 15.00', bg: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
    'B': { label: 'Pagi 2', time: '09.00 - 18.00', bg: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
    'C': { label: 'Siang', time: '14.00 - 23.00', bg: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-300' },
    'D': { label: 'Malam', time: '22.00 - 07.00', bg: 'bg-slate-800 text-slate-100', border: 'border-slate-700' },
    'L': { label: 'Libur', time: 'OFF DAY', bg: 'bg-red-100 text-red-700', border: 'border-red-300 border-dashed' },
  };

  const mod = (n, m) => ((n % m) + m) % m;
  const anchorDate = new Date(2026, 3, 27); // Senin, 27 April 2026

  const getDaysDiff = (date1, date2) => {
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
  };

  const getEmployeeSchedule = (empId, date) => {
    const diffDays = getDaysDiff(date, anchorDate);
    const weekIdx = Math.floor(diffDays / 7);
    const mappedDay = mod(date.getDay() - 1, 7); // 0=Sen, 1=Sel, 2=Rab, dst.

    // Libur bergilir: Rabu s/d Minggu
    const currentOffDayIndex = mod(empId + weekIdx, 5);
    const offDayMapped = [2, 3, 4, 5, 6][currentOffDayIndex]; 

    if (mappedDay === offDayMapped) return 'L';

    // Logika konsistensi 6 hari: Shift hanya berubah setelah melewati hari libur minggu ini
    let lastOffWeek = weekIdx;
    if (mappedDay < offDayMapped) lastOffWeek -= 1;

    const lastOffDayIndex = mod(empId + lastOffWeek, 5);
    const shiftMap = ['D', 'C', 'B', 'A', 'A'];

    return shiftMap[lastOffDayIndex];
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    // Sesuaikan agar Senin jadi kolom pertama
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < emptyDays; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <CalendarIcon size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Jadwal Shift Karyawan</h1>
              <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs font-medium uppercase tracking-wider">
                <RefreshCw size={14} className="text-emerald-500" /> Rotasi Otomatis Aktif
              </div>
            </div>
          </div>
          
          <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2.5 hover:bg-white rounded-lg transition-colors"><ChevronLeft size={20} /></button>
            <span className="px-6 font-bold text-sm min-w-[180px] text-center text-slate-700 uppercase tracking-widest italic">
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2.5 hover:bg-white rounded-lg transition-colors"><ChevronRight size={20} /></button>
          </div>
        </header>

        {/* Legend / Keterangan Shift */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(shiftTypes).map(([code, data]) => (
            <div key={code} className={`bg-white border ${data.border} p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center`}>
              <div className={`w-6 h-6 flex items-center justify-center rounded-md font-black text-[12px] mb-1.5 ${data.bg}`}>{code}</div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">{data.label}</span>
              <span className="font-semibold text-[10px] text-slate-500 mt-0.5">{data.time}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider py-4 text-center">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d, index) => (
              <div key={d} className={index === 6 ? 'text-red-500' : ''}>{d.slice(0,3)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-white">
            {calendarDays.map((date, idx) => {
              const isToday = date && date.toDateString() === today.toDateString();
              
              return (
                <div key={idx} className={`min-h-[150px] md:min-h-[190px] border-b border-r border-slate-100 p-1.5 md:p-2.5 transition-all ${!date ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'} ${isToday ? 'bg-blue-50/40' : ''}`}>
                  {date && (
                    <div className="h-full flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 bg-slate-100'}`}>
                          {date.getDate()}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 flex-1">
                        {employees.map(emp => {
                          const shift = getEmployeeSchedule(emp.id, date); 
                          const sData = shiftTypes[shift];
                          const isLibur = shift === 'L';
                          
                          return (
                            <div key={emp.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${sData.bg} ${sData.border} ${isLibur ? 'opacity-60' : ''}`}>
                              <span className="text-[10px] md:text-xs font-semibold tracking-tight">{emp.name.split(' ')[0]}</span>
                              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wide">{shift}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Aturan */}
        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2 italic"><RefreshCw size={16} className="text-emerald-500"/> Libur Bergilir</h3>
            <p className="text-xs text-slate-600">Jadwal libur bergeser +1 hari setiap minggu agar semua merasakan libur Minggu secara adil.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2 italic"><Lock size={16} className="text-blue-500"/> Konsistensi 6 Hari</h3>
            <p className="text-xs text-slate-600">Shift dikunci selama 6 hari kerja berturut-turut dan hanya berganti setelah melewati hari libur.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2 italic"><ShieldCheck size={16} className="text-purple-500"/> Full Coverage</h3>
            <p className="text-xs text-slate-600">Menjamin shift Pagi, Siang, dan Malam selalu terisi minimal 1 orang setiap hari tanpa kekosongan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;