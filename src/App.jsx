import React, { useState, useEffect } from 'react';

// 🔗 LIFT Token Contract Address (BSC Network)
const LIFT_CONTRACT_ADDRESS = "0x47b93c2a0920BBe10eFc7854b8FD04a02E85d031";

// ⚙️ 合约函数签名 (Function Selector)
// 0x4e71d92d is for claim()
const FUNCTION_SELECTOR = "0x4e71d92d"; 

// 🎨 12 Months Color Palette (Full Theme Support)
const MONTH_THEMES = [
  { name: "一月", color: "text-sky-500", dot: "bg-sky-400", btn: "bg-sky-500", border: "border-sky-500", hover: "hover:bg-sky-600", shadow: "shadow-sky-300" },
  { name: "二月", color: "text-rose-500", dot: "bg-rose-400", btn: "bg-rose-500", border: "border-rose-500", hover: "hover:bg-rose-600", shadow: "shadow-rose-300" },
  { name: "三月", color: "text-green-500", dot: "bg-green-400", btn: "bg-green-500", border: "border-green-500", hover: "hover:bg-green-600", shadow: "shadow-green-300" },
  { name: "四月", color: "text-emerald-500", dot: "bg-emerald-400", btn: "bg-emerald-500", border: "border-emerald-500", hover: "hover:bg-emerald-600", shadow: "shadow-emerald-300" },
  { name: "五月", color: "text-teal-500", dot: "bg-teal-400", btn: "bg-teal-500", border: "border-teal-500", hover: "hover:bg-teal-600", shadow: "shadow-teal-300" },
  { name: "六月", color: "text-cyan-500", dot: "bg-cyan-400", btn: "bg-cyan-500", border: "border-cyan-500", hover: "hover:bg-cyan-600", shadow: "shadow-cyan-300" },
  { name: "七月", color: "text-blue-500", dot: "bg-blue-400", btn: "bg-blue-500", border: "border-blue-500", hover: "hover:bg-blue-600", shadow: "shadow-blue-300" },
  { name: "八月", color: "text-indigo-500", dot: "bg-indigo-400", btn: "bg-indigo-500", border: "border-indigo-500", hover: "hover:bg-indigo-600", shadow: "shadow-indigo-300" },
  { name: "九月", color: "text-violet-500", dot: "bg-violet-400", btn: "bg-violet-500", border: "border-violet-500", hover: "hover:bg-violet-600", shadow: "shadow-violet-300" },
  { name: "十月", color: "text-orange-500", dot: "bg-orange-400", btn: "bg-orange-500", border: "border-orange-500", hover: "hover:bg-orange-600", shadow: "shadow-orange-300" },
  { name: "十一月", color: "text-amber-500", dot: "bg-amber-400", btn: "bg-amber-500", border: "border-amber-500", hover: "hover:bg-amber-600", shadow: "shadow-amber-300" },
  { name: "十二月", color: "text-red-500", dot: "bg-red-400", btn: "bg-red-500", border: "border-red-500", hover: "hover:bg-red-600", shadow: "shadow-red-300" },
];

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 状态管理
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // 每秒更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    
    // 自动检测钱包连接状态
    checkIfWalletIsConnected();

    return () => clearInterval(timer);
  }, []);

  // --- Web3 基础逻辑 ---
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("请先安装 MetaMask 或 OKX 钱包!");
        return;
      }
      
      setIsConnecting(true);
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setIsConnecting(false);
    } catch (error) {
      console.log(error);
      setIsConnecting(false);
    }
  };

  // --- 🔗 核心功能：调用合约 claim() ---
  const handleDailyCheckIn = async () => {
    if (!walletAddress) {
      connectWallet();
      return;
    }

    const { ethereum } = window;
    if (!ethereum) return;

    setCheckInLoading(true);

    try {
      const transactionParameters = {
        to: LIFT_CONTRACT_ADDRESS,
        from: walletAddress,
        data: FUNCTION_SELECTOR,
        value: '0x0',
      };

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log("Transaction Sent! Hash:", txHash);
      setIsCheckedInToday(true);
      setCheckInLoading(false);

    } catch (error) {
      console.error("Claim Failed:", error);
      setCheckInLoading(false);
      
      if (error.code !== 4001) {
        alert("交易发送失败，请检查网络是否在 BSC 链上。");
      }
    }
  };

  const formatAddressShort = (addr) => {
    return addr ? addr.slice(-4).toUpperCase() : '';
  };

  // --- 日期计算逻辑 ---
  const year = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); 
  const currentDayOfMonth = currentDate.getDate();
  const dayOfWeek = currentDate.toLocaleDateString('zh-CN', { weekday: 'long' });
  
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeapYear ? 366 : 365;

  const startOfYear = new Date(year, 0, 1);
  const diff = currentDate - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1;

  const progressPercentage = ((dayOfYear / totalDays) * 100).toFixed(2);
  const daysRemaining = totalDays - dayOfYear;

  const getDotStatus = (index) => {
    const date = new Date(year, 0, index + 1);
    const dotMonth = date.getMonth();
    const dotDay = date.getDate();

    if (dotMonth < currentMonthIndex) {
      return 'past';
    } else if (dotMonth > currentMonthIndex) {
      return 'future';
    } else {
      if (dotDay < currentDayOfMonth) {
        return 'past'; 
      } else {
        return 'urgent'; 
      }
    }
  };

  // 获取当前月份的主题配置
  const currentTheme = MONTH_THEMES[currentMonthIndex];

  // 极简钱包按钮 (Wallet Button - Small & English)
  const WalletButton = () => (
    <button 
      onClick={connectWallet}
      disabled={isConnecting}
      className={`
        w-14 md:w-16 h-10 md:h-12 rounded-xl flex items-center justify-center text-[10px] font-bold tracking-wider transition-all duration-300 border
        ${walletAddress 
          ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm' 
          : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600'
        }
      `}
    >
      {isConnecting ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : walletAddress ? (
        formatAddressShort(walletAddress) // 显示地址后4位
      ) : (
        "WALLET" // 显示英文单词
      )}
    </button>
  );

  // 垂直打卡按钮 (Check-in Button)
  const CheckInAction = () => {
    const baseClass = "group w-14 md:w-16 flex-1 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 active:scale-95 border";
    
    if (isCheckedInToday) {
      return (
        <div className={`${baseClass} bg-amber-50 border-amber-100 text-amber-600 cursor-default`}>
          <div className="flex flex-col text-sm md:text-base font-bold tracking-widest leading-tight opacity-90 text-center gap-2">
            <span>已</span>
            <span>领</span>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={handleDailyCheckIn}
        disabled={checkInLoading}
        // 🎨 使用 currentTheme 的颜色
        className={`${baseClass} ${currentTheme.btn} ${currentTheme.border} text-white ${currentTheme.hover} hover:shadow-lg hover:scale-[1.02] relative`}
      >
        <div className="flex flex-col text-lg md:text-xl font-bold tracking-widest leading-tight gap-2 items-center">
          {checkInLoading ? (
            <span className="text-base animate-pulse">...</span>
          ) : (
            <>
              {/* 改回“打卡” */}
              <span>打</span>
              <span>卡</span>
            </>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900 font-sans flex flex-col items-center py-6 px-4 md:py-10 selection:bg-zinc-800 selection:text-white">
      
      {/* --- 主卡片容器 --- */}
      <div className="w-full max-w-3xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-zinc-200/50 p-6 md:p-10 transition-all duration-500 flex flex-col min-h-[90vh] md:min-h-auto justify-between gap-6">
        
        {/* 顶部区域 */}
        <div>
          {/* Header */}
          <header className="mb-8 border-b border-zinc-100 pb-6">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* 左侧：日期信息 */}
                <div>
                   <div className="flex items-baseline gap-3 md:gap-4">
                    <span className="text-5xl md:text-6xl font-bold tracking-tighter text-zinc-900 leading-none">
                      {currentDayOfMonth}
                    </span>
                    {/* 🎨 动态月份颜色 */}
                    <span className={`text-2xl md:text-3xl font-medium ${currentTheme.color} transition-colors duration-500`}>
                      {currentTheme.name}
                    </span>
                    <span className="text-2xl md:text-3xl font-light text-zinc-400">
                      {year}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-medium text-zinc-500 tracking-wide">
                    {dayOfWeek}
                  </div>
                </div>

                {/* 右侧：钱包按钮 */}
                <div className="flex justify-end pt-2">
                   <WalletButton />
                </div>
             </div>
          </header>

          {/* --- 中间行：左侧月份 + 右侧功能列 --- */}
          <div className="mb-8 flex gap-4 md:gap-6 items-stretch">
            {/* 左侧：月份 (两排布局) */}
            <div className="flex-1">
              <div className="grid grid-cols-6 gap-2 md:gap-3 h-full">
                {MONTH_THEMES.map((m, idx) => {
                  const isActive = idx === currentMonthIndex;
                  const isPast = idx < currentMonthIndex;
                  
                  return (
                    <div 
                      key={m.name}
                      className={`
                        py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-semibold text-center transition-all duration-300 flex items-center justify-center
                        ${isActive 
                          ? `${m.btn} text-white shadow-lg ${m.shadow} scale-105` 
                          : isPast 
                            ? 'text-zinc-300 bg-zinc-50/50' 
                            : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                        }
                      `}
                    >
                      {m.name}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 右侧：功能列 */}
            <div className="shrink-0 flex flex-col justify-end">
               <CheckInAction />
            </div>
          </div>
        </div>

        {/* --- 核心：时光点阵 --- */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{year} Grid</h2>
            <div className="flex gap-2 md:gap-4 text-[10px] md:text-xs font-medium">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <div className="w-2 h-2 bg-zinc-900 rounded-full"></div> 已逝
              </div>
              {/* 🎨 动态图例颜色 */}
              <div className={`flex items-center gap-1.5 ${currentTheme.color}`}>
                <div className={`w-2 h-2 ${currentTheme.dot} rounded-full`}></div> 剩余
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <div className="w-2 h-2 bg-zinc-200 rounded-full"></div> 将来
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-[5px] gap-y-[10px] md:gap-[6px] justify-start content-start">
            {Array.from({ length: totalDays }).map((_, index) => {
              const status = getDotStatus(index);
              
              // 🎨 动态点阵样式: urgent 使用 currentTheme.dot
              let dotStyle = "";
              if (status === 'past') {
                dotStyle = "bg-zinc-900";
              } else if (status === 'urgent') {
                dotStyle = `${currentTheme.dot} animate-pulse-slow scale-110`;
              } else {
                dotStyle = "bg-zinc-200";
              }

              const dateForDot = new Date(year, 0, index + 1);
              const dateStr = dateForDot.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

              return (
                <div key={index} title={dateStr} className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full transition-all duration-500 ease-out cursor-default ${dotStyle}`} />
              );
            })}
          </div>
        </div>

        {/* 底部统计 */}
        <footer className="bg-zinc-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
          <div className="w-full md:w-1/2">
            <div className="flex justify-between text-sm font-semibold text-zinc-500 mb-2">
              <span>{progressPercentage}% 已过</span>
              <span>{100 - progressPercentage}% 剩余</span>
            </div>
            <div className="h-3 w-full bg-zinc-200 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-900 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
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
        TIME SCALE • 活在当下
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}@keyframes pulse-slow{0%,100%{opacity:1;transform:scale(1.1)}50%{opacity:0.8;transform:scale(1)}}.animate-pulse-slow{animation:pulse-slow 4s cubic-bezier(0.4,0,0.6,1) infinite}`}</style>
    </div>
  );
};

export default App;