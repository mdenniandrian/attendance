import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Lock, 
  Zap
} from 'lucide-react';

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Mei 2026
  const [today] = useState(new Date());

  // Data Karyawan (Urutan menentukan siklus libur)
  const employees = [
    { id: 0, name: 'Lukman', offDay: 3, avatar: 'bg-blue-500' },      // Libur Rabu
    { id: 1, name: 'Rafi', offDay: 4, avatar: 'bg-indigo-500' },        // Libur Kamis
    { id: 2, name: 'Rizky', offDay: 5, avatar: 'bg-emerald-500' },       // Libur Jumat
    { id: 3, name: 'Bagus', offDay: 6, avatar: 'bg-amber-500' },       // Libur Sabtu
    { id: 4, name: 'Coming Soon', offDay: 0, avatar: 'bg-rose-500' }, // Libur Minggu
  ];

  const shiftTypes = {
    'Malam': { time: '22.00 - 07.00', bg: 'bg-slate-800 text-white', border: 'border-slate-700' },
    'Siang': { time: '14.00 - 23.00', bg: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
    'Pagi 2': { time: '09.00 - 18.00', bg: 'bg-sky-100 text-sky-800', border: 'border-sky-200' },
    'Pagi 1': { time: '06.00 - 15.00', bg: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200' },
    'Libur': { time: 'OFF DAY', bg: 'bg-red-50 text-red-500', border: 'border-red-100 border-dashed' },
  };

  const mod = (n, m) => ((n % m) + m) % m;

  /**
   * ALGORITMA PRESISI ESTAFET
   */
  const getSlot = (empId, d) => {
    // Titik jangkar rotasi: Tanggal mulai cycle untuk masing-masing orang
    const baseDate = new Date(2026, 3, 23 + empId); 
    baseDate.setHours(0,0,0,0);
    
    const diffTime = d.getTime() - baseDate.getTime();
    const cycleIndex = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    return mod(empId + cycleIndex, 5);
  };

  const getDailySchedule = (date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    
    const schedule = {};
    const roles = {};
    const isOff = {};

    // 1. Cek Libur & Tentukan Slot
    employees.forEach(emp => {
      const dDay = d.getDay();
      if (dDay === emp.offDay) {
        isOff[emp.id] = true;
        schedule[emp.id] = 'Libur';
      } else {
        isOff[emp.id] = false;
      }
      roles[emp.id] = getSlot(emp.id, d);
    });

    // 2. Distribusi Shift
    const shiftOrder = ['Malam', 'Siang', 'Pagi 2', 'Pagi 1'];
    let activeCoreShifts = new Set();
    let reliefEmpId = -1;

    // Isi spesialis inti (Slot 0-3)
    employees.forEach(emp => {
      if (isOff[emp.id]) return;
      const slot = roles[emp.id];
      if (slot === 4) {
        reliefEmpId = emp.id; // Ini adalah penjaga ganti (Relief)
      } else {
        schedule[emp.id] = shiftOrder[slot];
        activeCoreShifts.add(shiftOrder[slot]);
      }
    });

    // 3. Tugas Relief: Menambal shift inti yang kosong
    if (reliefEmpId !== -1) {
      let missingShift = null;
      for (let s of shiftOrder) {
        if (!activeCoreShifts.has(s)) {
          missingShift = s;
          break;
        }
      }
      // Jika ada shift kosong, Relief mengisinya. Jika tidak, Double Pagi 1.
      schedule[reliefEmpId] = missingShift ? missingShift : 'Pagi 1';
    }

    return schedule;
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
        
        {/* Modern Header */}
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
                <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Algoritma Presisi 6:1 Aktif</p>
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

        {/* Info Cards (Legend) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(shiftTypes).map(([name, data]) => (
            <div key={name} className={`${data.bg} border ${data.border} p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1`}>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{name}</span>
              <span className="font-bold text-xs">{data.time}</span>
            </div>
          ))}
        </div>

        {/* Main Calendar View */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-7 bg-slate-950 text-slate-400 font-black text-[10px] md:text-xs uppercase tracking-widest py-6 border-b border-slate-800">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
              <div key={d} className="text-center">{d.slice(0,3)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-slate-900">
            {calendarDays.map((date, idx) => {
              // Pastikan getDailySchedule selalu dipanggil dengan aman
              const schedule = date ? getDailySchedule(date) : {};
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
                          // Pastikan shift selalu memiliki nilai string yang valid
                          const shift = schedule[emp.id] || 'Libur'; 
                          const sData = shiftTypes[shift] || shiftTypes['Libur'];
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
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">100% Shift Tercover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algoritma otomatis memposisikan petugas ke-5 sebagai pilar penutup. Jika spesialis Malam libur, sistem langsung menugaskan orang ke-5 untuk shift Malam. Tidak ada lagi shift kosong.
            </p>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">Konsistensi 6 Hari</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Setiap karyawan dipastikan memegang shift yang persis sama selama 6 hari kerja. Shift baru (estafet) hanya akan diterima tepat setelah hari libur (OFF) selesai.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
            <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-white mb-2">Pagi 1 Double Power</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pada hari Senin dan Selasa, di mana semua 5 orang masuk, sistem otomatis memusatkan kekuatan dengan menempatkan 2 orang (Double) secara bersamaan di shift Pagi 1.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;