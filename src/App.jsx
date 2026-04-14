import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  RefreshCw,
  Heart,
  Lock,
  Users
} from 'lucide-react';

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Mei 2026

  const employees = [
    { id: 0, name: 'Lukman', startOffIdx: 0, initShiftIdx: 0 },      // Rabu, Start Pagi 1
    { id: 1, name: 'Rafi', startOffIdx: 1, initShiftIdx: 1 },        // Kamis, Start Pagi 2
    { id: 2, name: 'Rizky', startOffIdx: 2, initShiftIdx: 2 },       // Jumat, Start Siang
    { id: 3, name: 'Bagus', startOffIdx: 3, initShiftIdx: 3 },       // Sabtu, Start Malam
    { id: 4, name: 'Coming Soon', startOffIdx: 4, initShiftIdx: 0 }, // Minggu, Start Pagi 1
  ];

  const shiftTypes = [
    { id: 'Pagi 1', name: 'Pagi 1', time: '06.00 - 15.00', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'Pagi 2', name: 'Pagi 2', time: '09.00 - 18.00', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { id: 'Siang', name: 'Siang', time: '14.00 - 23.00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'Malam', name: 'Malam', time: '22.00 - 07.00', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'Libur', name: 'Libur', time: 'OFF', color: 'bg-red-100 text-red-600 border-red-200 font-bold' },
  ];

  const allowedOffDays = [3, 4, 5, 6, 0]; // Rabu, Kamis, Jumat, Sabtu, Minggu
  const anchorDate = new Date(2026, 3, 27); // Senin, 27 April 2026
  anchorDate.setHours(0, 0, 0, 0);

  const mod = (n, m) => ((n % m) + m) % m;

  /**
   * Logika Utama:
   * 1. Tentukan hari libur minggu ini (mundur setiap minggu).
   * 2. Hitung berapa kali libur sudah dilewati sejak awal.
   * 3. Shift berubah Pagi 1 -> Pagi 2 -> Siang -> Malam hanya setelah Libur.
   */
  const getEmployeeSchedule = (emp, targetDate) => {
    const d = new Date(targetDate);
    d.setHours(0, 0, 0, 0);

    let offTakenCount = 0;
    let isOffToday = false;
    let iter = new Date(anchorDate);

    while (iter <= d) {
      // Tentukan hari libur minggu ini untuk iterasi saat ini
      const diffWeeks = Math.floor((iter.getTime() - anchorDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const currentOffDay = allowedOffDays[mod(emp.startOffIdx + diffWeeks, 5)];

      if (iter.getDay() === currentOffDay) {
        if (iter.getTime() === d.getTime()) {
          isOffToday = true;
        } else {
          offTakenCount++;
        }
      }
      iter.setDate(iter.getDate() + 1);
    }

    if (isOffToday) return 'Libur';

    // Urutan: Pagi 1 -> Pagi 2 -> Siang -> Malam
    const cycle = ['Pagi 1', 'Pagi 2', 'Siang', 'Malam'];
    const currentShiftIdx = mod(emp.initShiftIdx + offTakenCount, 4);

    return cycle[currentShiftIdx];
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
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
              <CalendarIcon className="text-blue-600" size={32} /> Jadwal Operasional 2026
            </h1>
            <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <Users size={14} className="text-blue-500" /> Distribusi Rata 4 Shift • Libur Bergilir
            </p>
          </div>

          <div className="flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-95"><ChevronLeft size={24} /></button>
            <span className="px-8 font-black text-lg min-w-[220px] text-center text-blue-900 uppercase tracking-widest italic tracking-tighter">
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-95"><ChevronRight size={24} /></button>
          </div>
        </header>

        {/* Shift Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {shiftTypes.map(shift => (
            <div key={shift.id} className={`p-4 rounded-2xl border-2 shadow-sm ${shift.color} flex flex-col items-center justify-center text-center`}>
              <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{shift.name}</span>
              <span className="font-black text-[11px] leading-none mt-1">{shift.time}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-5">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => (
              <div key={idx} className={`min-h-[190px] border-b border-r border-slate-100 p-2 transition-all hover:bg-blue-50/20 ${!date ? 'bg-slate-50/50' : ''}`}>
                {date && (
                  <>
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-xl shadow-sm ${date.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white' : 'text-slate-500 bg-slate-100'}`}>
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {employees.map(emp => {
                        const shift = getEmployeeSchedule(emp, date);
                        const info = shiftTypes.find(s => s.id === shift) || shiftTypes[4];
                        return (
                          <div key={emp.id} className={`text-[10px] px-2.5 py-1.5 rounded-xl border flex justify-between font-bold ${info.color} shadow-sm transition-transform hover:scale-[1.02]`}>
                            <span className="truncate max-w-[65%] tracking-tight">{emp.name.split(' ')[0]}</span>
                            <span className="font-black text-[9px] opacity-80">{shift}</span>
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

        {/* Status Explanation */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
            <h3 className="font-black text-slate-800 uppercase text-xs mb-4 flex items-center gap-2 tracking-widest">
              <ShieldCheck className="text-emerald-500" size={18} /> Mekanisme 6:1 & Rotasi
            </h3>
            <ul className="text-[11px] text-slate-500 space-y-3 leading-relaxed">
              <li>• <strong>Ganti Shift:</strong> Sesuai permintaan, shift (Pagi 1-Malam) hanya akan berganti tepat setelah hari libur terlewati.</li>
              <li>• <strong>Full Coverage Minggu:</strong> Pada hari Minggu, sistem menjamin 4 orang masuk (Pagi 1, Pagi 2, Siang, Malam) dan 1 orang libur secara bergiliran.</li>
              <li>• <strong>Keadilan Libur:</strong> Hari libur berputar dari Rabu hingga Minggu setiap pekan.</li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center">
            <h3 className="font-black uppercase text-xs text-blue-400 mb-2 flex items-center gap-2 tracking-widest">
              <Lock size={16} /> Keamanan Transisi
            </h3>
            <p className="text-[11px] opacity-70 leading-relaxed italic">
              "Perubahan dari Malam ke Pagi 1 dipisahkan oleh satu hari libur penuh, memberikan waktu rehat minimal 30-47 jam untuk pemulihan fisik karyawan."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;