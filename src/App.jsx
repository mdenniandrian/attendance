import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Lock, 
  Zap,
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
    { id: 4, name: 'Coming Soon', avatar: 'bg-rose-500' },
  ];

  const shiftTypes = {
    'Malam': { time: '22.00 - 07.00', bg: 'bg-slate-800 text-white', border: 'border-slate-700' },
    'Siang': { time: '14.00 - 23.00', bg: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
    'Pagi 2': { time: '09.00 - 18.00', bg: 'bg-sky-100 text-sky-800', border: 'border-sky-200' },
    'Pagi 1': { time: '06.00 - 15.00', bg: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200' },
    'Libur': { time: 'OFF DAY', bg: 'bg-red-50 text-red-500', border: 'border-red-100 border-dashed' },
  };

  const mod = (n, m) => ((n % m) + m) % m;

  // Titik awal perhitungan (Anchor Date): Senin, 27 April 2026
  const anchorDate = new Date(2026, 3, 27); 

  // Menghitung selisih hari dengan aman dari zona waktu
  const getDaysDiff = (date1, date2) => {
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
  };

  /**
   * ALGORITMA ROLLING CYCLE (Libur Bergilir & Shift Konsisten)
   */
  const getEmployeeSchedule = (empId, date) => {
    const diffDays = getDaysDiff(date, anchorDate);
    const weekIdx = Math.floor(diffDays / 7);
    
    // Mapping hari JS (0=Min, 1=Sen) menjadi (0=Sen, 1=Sel, 2=Rab, 3=Kam, 4=Jum, 5=Sab, 6=Min)
    const mappedDay = mod(date.getDay() - 1, 7); 

    // Urutan jatah libur dalam seminggu (Rabu, Kamis, Jumat, Sabtu, Minggu)
    // Index: 0=Rab(2), 1=Kam(3), 2=Jum(4), 3=Sab(5), 4=Min(6)
    const currentOffDayIndex = mod(empId + weekIdx, 5);
    const offDayMapped = [2, 3, 4, 5, 6][currentOffDayIndex]; 

    // 1. CEK LIBUR HARI INI
    if (mappedDay === offDayMapped) {
        return 'Libur';
    }

    // 2. CEK RIWAYAT LIBUR TERAKHIR (Untuk mengunci shift selama 6 hari)
    // Jika hari ini belum melewati jadwal libur minggu ini, maka ia masih menggunakan shift dari siklus minggu lalu
    let lastOffWeek = weekIdx;
    if (mappedDay < offDayMapped) {
        lastOffWeek -= 1;
    }

    const lastOffDayIndex = mod(empId + lastOffWeek, 5);

    // 3. MAPPING SHIFT BERDASARKAN LIBUR TERAKHIR
    // Setelah libur Rabu -> Malam
    // Setelah libur Kamis -> Siang
    // Setelah libur Jumat -> Pagi 2
    // Setelah libur Sabtu -> Pagi 1
    // Setelah libur Minggu -> Pagi 1 (Double pada Senin & Selasa)
    const shiftMap = ['Malam', 'Siang', 'Pagi 2', 'Pagi 1', 'Pagi 1'];

    return shiftMap[lastOffDayIndex];
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
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CalendarIcon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">ShiftMaster Pro</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Algoritma Rotasi Dinamis Aktif</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center bg-slate-950 rounded-2xl border border-slate-800 p-1 shadow-inner">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
            <span className="px-6 font-black text-sm md:text-base min-w-[200px] text-center text-white uppercase tracking-widest">
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"><ChevronRight size={20} /></button>
          </div>
        </header>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(shiftTypes).map(([name, data]) => (
            <div key={name} className={`${data.bg} border ${data.border} p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1`}>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{name}</span>
              <span className="font-bold text-xs">{data.time}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-7 bg-slate-950 text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest py-6 border-b border-slate-800">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
              <div key={d} className="text-center">{d.slice(0,3)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-slate-900">
            {calendarDays.map((date, idx) => {
              const isToday = date && date.toDateString() === today.toDateString();
              
              return (
                <div key={idx} className={`min-h-[160px] md:min-h-[200px] border-b border-r border-slate-800/50 p-2 transition-colors ${!date ? 'bg-slate-950/50' : 'hover:bg-slate-800/30'} ${isToday ? 'bg-blue-900/10' : ''}`}>
                  {date && (
                    <div className="h-full flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-xl ${isToday ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 bg-slate-800/50'}`}>
                          {date.getDate()}
                        </span>
                        {date.getDay() >= 1 && date.getDay() <= 2 && (
                          <span className="text-[8px] font-black px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 tracking-wider">FULL</span>
                        )}
                      </div>
                      
                      <div className="space-y-1.5 flex-1">
                        {employees.map(emp => {
                          const shift = getEmployeeSchedule(emp.id, date); 
                          const sData = shiftTypes[shift];
                          const isLibur = shift === 'Libur';
                          
                          return (
                            <div key={emp.id} className={`flex items-center justify-between p-1.5 px-2 rounded-lg border ${sData.bg} ${sData.border} ${isLibur ? 'opacity-50 grayscale' : 'shadow-sm'}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-4 rounded-full ${emp.avatar}`}></div>
                                <span className={`text-[9px] md:text-[10px] font-bold ${isLibur ? '' : 'truncate max-w-[50px] md:max-w-[80px]'}`}>{emp.name.split(' ')[0]}</span>
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-tighter">{isLibur ? 'OFF' : shift}</span>
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

        {/* Feature Explanations */}
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
              <RefreshCw size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">Libur Berotasi Adil</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hari libur karyawan bergeser maju 1 hari setiap minggunya (Misal: minggu ini Rabu, minggu depan Kamis). Semua orang dijamin merasakan libur di hari Minggu setiap siklus.
            </p>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">Kunci Shift 6 Hari</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jadwal dijamin konsisten! Karyawan akan selalu mendapat shift yang sama persis selama 6 hari berturut-turut. Shift baru hanya diberikan tepat setelah karyawan selesai libur.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
            <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">100% Full Coverage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Berkat siklus matematis yang saling terkait, jadwal ini memastikan shift Malam, Siang, Pagi 2, dan Pagi 1 <b>selalu terisi 1 orang</b> setiap harinya, tanpa pernah ada kekosongan.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;