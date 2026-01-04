import React, { useState, useEffect } from 'react';

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Date Logic Helpers
  const year = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0-11
  const currentDayOfMonth = currentDate.getDate();
  const dayOfWeek = currentDate.toLocaleDateString('zh-CN', { weekday: 'long' });
  
  // Leap Year Check
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeapYear ? 366 : 365;

  // Calculate Day of Year (1 - 365/366)
  const startOfYear = new Date(year, 0, 1);
  const diff = currentDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1;

  // Percentage
  const progressPercentage = ((dayOfYear / totalDays) * 100).toFixed(2);

  // Remaining days
  const daysRemaining = totalDays - dayOfYear;

  // Months Data
  const months = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  // Grid Logic Helper: New Logic for Current Month Focus
  const getDotStatus = (index) => {
    // Construct date from day-of-year index
    const date = new Date(year, 0, index + 1);
    const dotMonth = date.getMonth();
    const dotDay = date.getDate();

    // Logic:
    // 1. Past months -> Black
    // 2. Future months -> Gray
    // 3. Current month:
    //    - Days before today -> Black
    //    - Today and rest of month -> Red
    
    if (dotMonth < currentMonthIndex) {
      return 'past';
    } else if (dotMonth > currentMonthIndex) {
      return 'future';
    } else {
      // Inside Current Month
      if (dotDay < currentDayOfMonth) {
        return 'past'; 
      } else {
        return 'urgent'; // Rest of this month (including today)
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900 font-sans flex flex-col items-center py-6 px-4 md:py-10 selection:bg-zinc-800 selection:text-white">
      
      {/* --- Main Card Container --- */}
      <div className="w-full max-w-3xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-zinc-200/50 p-6 md:p-12 transition-all duration-500 flex flex-col min-h-[85vh] md:min-h-auto justify-between">
        
        {/* Top Section Wrapper */}
        <div>
          {/* 1. Header: Clean Date Layout */}
          <header className="flex flex-col md:flex-row md:items-baseline justify-between mb-8 md:mb-10 border-b border-zinc-100 pb-6">
            <div className="flex items-baseline gap-3 md:gap-5">
              {/* Day */}
              <span className="text-5xl md:text-6xl font-bold tracking-tighter text-zinc-900">
                {currentDayOfMonth}
              </span>
              
              {/* Month */}
              <span className="text-2xl md:text-3xl font-medium text-zinc-600">
                {months[currentMonthIndex]}
              </span>
              
              {/* Year */}
              <span className="text-2xl md:text-3xl font-light text-zinc-400">
                {year}
              </span>
            </div>

            <div className="mt-2 md:mt-0">
              <span className="text-lg md:text-xl font-medium text-zinc-500 tracking-wide">
                {dayOfWeek}
              </span>
            </div>
          </header>

          {/* 2. Middle: Month Selector */}
          <div className="mb-8 md:mb-12 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex justify-between min-w-max gap-3 md:gap-4">
              {months.map((m, idx) => {
                const isActive = idx === currentMonthIndex;
                const isPast = idx < currentMonthIndex;
                
                return (
                  <div 
                    key={m}
                    className={`
                      px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                      ${isActive 
                        ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-300 scale-105' 
                        : isPast 
                          ? 'text-zinc-300' 
                          : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                      }
                    `}
                  >
                    {m}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Core: The Time Grid (Extended Vertical Spacing for Mobile) */}
        <div className="mb-8 md:mb-12 flex-grow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              {year} Grid
            </h2>
            <div className="flex gap-3 md:gap-4 text-[10px] md:text-xs font-medium">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <div className="w-2 h-2 bg-zinc-900 rounded-full"></div> 已逝
              </div>
              <div className="flex items-center gap-1.5 text-rose-500">
                <div className="w-2 h-2 bg-rose-400 rounded-full"></div> 本月剩余
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <div className="w-2 h-2 bg-zinc-200 rounded-full"></div> 将来
              </div>
            </div>
          </div>
          
          {/* Grid Layout Update:
             - Increased gap-y (vertical gap) significantly for mobile to elongate the middle section.
             - Used flex-wrap to ensure it fills space naturally.
          */}
          <div className="flex flex-wrap gap-x-[5px] gap-y-[10px] md:gap-[6px] justify-start content-start">
            {Array.from({ length: totalDays }).map((_, index) => {
              const status = getDotStatus(index);
              
              // Dynamic styles based on status
              let dotStyle = "";
              if (status === 'past') {
                dotStyle = "bg-zinc-900";
              } else if (status === 'urgent') {
                dotStyle = "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)] animate-pulse-slow";
              } else {
                dotStyle = "bg-zinc-200";
              }

              // Tooltip title
              const dateForDot = new Date(year, 0, index + 1);
              const dateStr = dateForDot.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={index}
                  title={dateStr}
                  className={`
                    w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full 
                    transition-all duration-500 ease-out cursor-default
                    ${status === 'urgent' ? 'scale-110' : ''}
                    ${dotStyle}
                  `}
                />
              );
            })}
          </div>
        </div>

        {/* 4. Bottom: Stats */}
        <footer className="bg-zinc-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
          <div className="w-full md:w-1/2">
            <div className="flex justify-between text-sm font-semibold text-zinc-500 mb-2">
              <span>{progressPercentage}% 已过</span>
              <span>{100 - progressPercentage}% 剩余</span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-900 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center divide-x divide-zinc-200">
            <div className="px-4 md:px-6 text-center">
              <span className="block text-2xl md:text-3xl font-bold text-zinc-900">{dayOfYear}</span>
              <span className="text-[10px] md:text-xs text-zinc-400 uppercase font-semibold tracking-wider">已过天数</span>
            </div>
            <div className="px-4 md:px-6 text-center">
              <span className="block text-2xl md:text-3xl font-bold text-rose-500">{daysRemaining}</span>
              <span className="text-[10px] md:text-xs text-zinc-400 uppercase font-semibold tracking-wider">剩余天数</span>
            </div>
          </div>
        </footer>

      </div>
      
      <div className="mt-6 md:mt-8 text-zinc-400 text-xs font-medium tracking-wide pb-4">
        TIME SCALE &bull; 活在当下
      </div>

      <style>{`
        /* Custom scrollbar hiding */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1.1); }
          50% { opacity: 0.8; transform: scale(1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default App;