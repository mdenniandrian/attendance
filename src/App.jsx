import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Lock, 
  RefreshCw,
  Info,
  CalendarDays
} from 'lucide-react';

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Default Mei 2026
  const [today] = useState(new Date());

  // Data Karyawan
  const employees = [
    { id: 0, name: 'Lukman', avatar: 'bg-blue-500' },
    { id: 1, name: 'Rafi', avatar: 'bg-indigo-500' },
    { id: 2, name: 'Rizky', avatar: 'bg-emerald-500' },
    { id: 3, name: 'Bagus', avatar: 'bg-amber-500' },
    { id: 4, name: 'Member', avatar: 'bg-rose-500' },
  ];

  // Konfigurasi Shift (A: Hijau, B: Biru, C: Kuning, D: Malam, L: Merah)
  const shiftTypes = {
    'A': { label: 'Pagi 1', time: '06.00 - 15.00', bg: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
    'B': { label: 'Pagi 2', time: '09.00 - 18.00', bg: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
    'C': { label: 'Siang', time: '14.00 - 23.00', bg: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-300' },
    'D': { label: 'Malam', time: '22.00 - 07.00', bg: 'bg-slate-800 text-slate-100', border: 'border-slate-700' },
    'L': { label: 'Libur', time: 'OFF DAY', bg: 'bg-red-100 text-red-700', border: 'border-red-300 border-dashed' },
  };

  // Database Hari Libur Nasional & Cuti Bersama 2026
  const holidays2026 = {
    "2026-01-01": { name: "Tahun Baru 2026 Masehi", type: "nasional" },
    "2026-01-20": { name: "Tahun Baru Imlek 2577 Kongzili", type: "nasional" },
    "2026-02-15": { name: "Isra Mikraj Nabi Muhammad SAW", type: "nasional" },
    "2026-03-20": { name: "Nyepi & Idul Fitri 1447 H", type: "nasional" },
    "2026-03-21": { name: "Hari Raya Idul Fitri 1447 H", type: "nasional" },
    "2026-03-23": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
    "2026-03-24": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
    "2026-03-25": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
    "2026-03-26": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
    "2026-04-03": { name: "Wafat Yesus Kristus", type: "nasional" },
    "2026-04-05": { name: "Hari Paskah", type: "nasional" },
    "2026-05-01": { name: "Hari Buruh Internasional", type: "nasional" },
    "2026-05-14": { name: "Kenaikan Yesus Kristus", type: "nasional" },
    "2026-05-27": { name: "Hari Raya Waisak 2570 BE", type: "nasional" },
    "2026-06-01": { name: "Hari Lahir Pancasila", type: "nasional" },
    "2026-06-06": { name: "Hari Raya Idul Adha 1447 H", type: "nasional" },
    "2026-06-27": { name: "Tahun Baru Islam 1448 H", type: "nasional" },
    "2026-08-17": { name: "Hari Kemerdekaan RI", type: "nasional" },
    "2026-09-05": { name: "Maulid Nabi Muhammad SAW", type: "nasional" },
    "2026-12-25": { name: "Hari Raya Natal", type: "nasional" },
    "2026-12-26": { name: "Cuti Bersama Natal", type: "cuti" },
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
    const mappedDay = mod(date.getDay() - 1, 7); 

    const currentOffDayIndex = mod(empId + weekIdx, 5);
    const offDayMapped = [2, 3, 4, 5, 6][currentOffDayIndex]; 

    if (mappedDay === offDayMapped) return 'L';

    let lastOffWeek = weekIdx;
    if (mappedDay < offDayMapped) lastOffWeek -= 1;

    const lastOffDayIndex = mod(empId + lastOffWeek, 5);
    const shiftMap = ['D', 'C', 'B', 'A', 'A'];

    return shiftMap[lastOffDayIndex];
  };

  // Mengelompokkan tanggal ke dalam minggu (arrays of 7)
  const calendarWeeks = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < emptyDays; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    
    // Pecah jadi baris per 7 hari
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [currentMonth]);

  const getFormattedDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

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
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Jadwal Shift & Libur 2026</h1>
              <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs font-medium uppercase tracking-wider">
                <RefreshCw size={14} className="text-emerald-500" /> Rotasi Otomatis & Keterangan Mingguan
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

        {/* Calendar Grid Container */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
          {/* Hari Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider py-4 text-center">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d, index) => (
              <div key={d} className={index === 6 ? 'text-red-500' : ''}>{d}</div>
            ))}
          </div>

          {/* Render Week by Week */}
          <div className="bg-white">
            {calendarWeeks.map((week, weekIdx) => {
              // Cari semua hari libur dalam minggu ini
              const weekHolidays = week
                .map(date => {
                  const key = getFormattedDateKey(date);
                  return key ? { date: date.getDate(), ...holidays2026[key] } : null;
                })
                .filter(h => h && h.name);

              return (
                <React.Fragment key={weekIdx}>
                  {/* Baris Tanggal & Jadwal */}
                  <div className="grid grid-cols-7">
                    {week.map((date, dayIdx) => {
                      const dateStr = getFormattedDateKey(date);
                      const holiday = dateStr ? holidays2026[dateStr] : null;
                      const isToday = date && date.toDateString() === today.toDateString();
                      const isSunday = dayIdx === 6; // Minggu selalu kolom ke-7
                      
                      return (
                        <div key={dayIdx} className={`min-h-[160px] md:min-h-[210px] border-b border-r border-slate-100 p-1.5 md:p-2.5 transition-all ${!date ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'} ${isToday ? 'bg-blue-50/40' : ''}`}>
                          {date && (
                            <div className="h-full flex flex-col">
                              <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg ${
                                  holiday?.type === 'nasional' || isSunday ? 'bg-red-500 text-white shadow-md shadow-red-100' : 
                                  holiday?.type === 'cuti' ? 'bg-rose-100 text-rose-600' :
                                  isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 
                                  'text-slate-600 bg-slate-100'
                                }`}>
                                  {date.getDate()}
                                </span>
                              </div>
                              
                              <div className="space-y-1.5 flex-1">
                                {employees.map(emp => {
                                  const shift = getEmployeeSchedule(emp.id, date); 
                                  const sData = shiftTypes[shift];
                                  const isLibur = shift === 'L';
                                  
                                  return (
                                    <div key={emp.id} className={`flex items-center justify-between px-2 py-1 rounded-md border ${sData.bg} ${sData.border} ${isLibur ? 'opacity-50' : ''}`}>
                                      <span className="text-[9px] md:text-[10px] font-semibold tracking-tight">{emp.name.split(' ')[0]}</span>
                                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wide">{shift}</span>
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

                  {/* Baris Keterangan Tanggal Merah Mingguan (Hanya muncul jika ada libur) */}
                  {weekHolidays.length > 0 && (
                    <div className="bg-red-50/40 border-b border-slate-100 px-4 py-2 flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5 text-red-600">
                        <Info size={12} className="shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Keterangan:</span>
                      </div>
                      {weekHolidays.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${h.type === 'nasional' ? 'bg-red-500 text-white' : 'bg-rose-100 text-rose-600'}`}>
                            Tgl {h.date}
                          </span>
                          <span className="text-[10px] font-medium text-slate-700">{h.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
           <div className="space-y-1">
             <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
               <ShieldCheck size={18} className="text-emerald-500" /> Jaminan Operasional
             </h3>
             <p className="text-xs text-slate-600 italic">"Shift Pagi, Siang, dan Malam tetap terisi 100% setiap hari, termasuk hari libur nasional."</p>
           </div>
           <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
               <span className="text-[10px] font-bold uppercase text-slate-500">Nasional</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-rose-100 rounded-sm"></div>
               <span className="text-[10px] font-bold uppercase text-slate-500">Cuti Bersama</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;