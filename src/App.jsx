import React, { useState, useEffect } from 'react';

// 🔗 LIFT Token Contract Address (BSC Network)
const LIFT_CONTRACT_ADDRESS = "0x47b93c2a0920BBe10eFc7854b8FD04a02E85d031";

// ⚙️ 合约函数签名 (Function Selector)
// 根据您提供的合约代码: function claim() public returns (bool)
// claim() 的 16 进制签名确实是 0x4e71d92d
const FUNCTION_SELECTOR = "0x4e71d92d"; 

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
    // 1. 如果没连钱包，先连钱包
    if (!walletAddress) {
      connectWallet();
      return;
    }

    const { ethereum } = window;
    if (!ethereum) return;

    setCheckInLoading(true);

    try {
      // 2. 构造 BSC 交易参数
      // 您的合约是 PVP 模式，谁点谁领走当前积累的币
      const transactionParameters = {
        to: LIFT_CONTRACT_ADDRESS, // 合约地址
        from: walletAddress,       // 您的地址
        data: FUNCTION_SELECTOR,   // 调用 claim()
        value: '0x0',              // 0 ETH/BNB
      };

      // 3. 唤起钱包签名
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log("Transaction Sent! Hash:", txHash);

      // 4. 交易已发送
      // 为了更好的体验，我们假设发送即成功，变为“已领”状态
      setIsCheckedInToday(true);
      setCheckInLoading(false);

    } catch (error) {
      console.error("Claim Failed:", error);
      setCheckInLoading(false);
      
      // 如果用户取消了
      if (error.code !== 4001) {
        alert("交易发送失败，请检查网络是否在 BSC 链上。");
      }
    }
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
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

  const months = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

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

  // 极简钱包状态指示器 (仅一个小圆点)
  const WalletIndicator = () => {
    if (!walletAddress) return null; // 未连接时不显示任何东西，保持极简
    return (
      <div className="absolute top-0 right-0 -mt-2 -mr-2">
         <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
      </div>
    );
  };

  // --- 垂直打卡按钮 (完美适配月份高度) ---
  const CheckInAction = () => {
    const baseClass = "group w-14 md:w-16 h-full rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 active:scale-95 border";
    
    // 状态 1: 已领 (交易已发送)
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

    // 状态 2: 打卡/领币 (PVP Claim)
    // 无论是否连接钱包，都显示“打卡”，点击时自动处理连接
    return (
      <button
        onClick={handleDailyCheckIn}
        disabled={checkInLoading}
        className={`${baseClass} bg-rose-500 border-rose-500 text-white hover:bg-rose-600 hover:shadow-rose-200/50 hover:scale-[1.02] relative`}
      >
        <div className="flex flex-col text-lg md:text-xl font-bold tracking-widest leading-tight gap-2 items-center">
          {checkInLoading ? (
            <span className="text-base animate-pulse">...</span>
          ) : (
            <>
              {/* 极简文字: 打卡 */}
              <span>打</span>
              <span>卡</span>
            </>
          )}
        </div>
        {/* 如果已连接钱包，显示一个小绿点指示 */}
        <WalletIndicator />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900 font-sans flex flex-col items-center py-6 px-4 md:py-10 selection:bg-zinc-800 selection:text-white">
      
      {/* --- 主卡片容器 --- */}
      <div className="w-full max-w-3xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-zinc-200/50 p-6 md:p-10 transition-all duration-500 flex flex-col min-h-[90vh] md:min-h-auto justify-between gap-6">
        
        {/* 顶部区域 */}
        <div>
          {/* 日期头部 (钱包按钮已移除，改为集成在打卡按钮上或隐藏) */}
          <header className="flex flex-col gap-6 mb-8 border-b border-zinc-100 pb-6 md:flex-row md:items-start md:justify-between">
            {/* 左侧：大日期 */}
            <div>
               <div className="flex items-baseline gap-3 md:gap-4">
                <span className="text-5xl md:text-6xl font-bold tracking-tighter text-zinc-900 leading-none">
                  {currentDayOfMonth}
                </span>
                <span className="text-2xl md:text-3xl font-medium text-zinc-600">
                  {months[currentMonthIndex]}
                </span>
                <span className="text-2xl md:text-3xl font-light text-zinc-400">
                  {year}
                </span>
              </div>
              <div className="mt-2 text-lg font-medium text-zinc-500 tracking-wide">
                {dayOfWeek}
              </div>
            </div>
            
            {/* 右侧：原本的钱包按钮区域现在留空，保持极简，钱包状态通过打卡按钮上的小绿点暗示 */}
            <div className="hidden md:block">
               {/* Spacer if needed */}
            </div>
          </header>

          {/* --- 中间行：左侧月份 + 右侧打卡按钮 --- */}
          <div className="mb-8 flex gap-4 md:gap-6 items-stretch">
            {/* 左侧：月份 (两排布局) */}
            <div className="flex-1">
              <div className="grid grid-cols-6 gap-2 md:gap-3 h-full">
                {months.map((m, idx) => {
                  const isActive = idx === currentMonthIndex;
                  const isPast = idx < currentMonthIndex;
                  return (
                    <div 
                      key={m}
                      className={`
                        py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-semibold text-center transition-all duration-300 flex items-center justify-center
                        ${isActive 
                          ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-300 scale-105' 
                          : isPast 
                            ? 'text-zinc-300 bg-zinc-50/50' 
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

            {/* 右侧：打卡按钮 (自动高度) */}
            <div className="shrink-0">
               <CheckInAction />
            </div>
          </div>
        </div>

        {/* --- 核心：时光点阵 --- */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{year} Grid</h2>
            <div className="flex gap-2 md:gap-4 text-[10px] md:text-xs font-medium">
              <div className="flex items-center gap-1.5 text-zinc-500"><div className="w-2 h-2 bg-zinc-900 rounded-full"></div> 已逝</div>
              <div className="flex items-center gap-1.5 text-rose-500"><div className="w-2 h-2 bg-rose-400 rounded-full"></div> 剩余</div>
              <div className="flex items-center gap-1.5 text-zinc-400"><div className="w-2 h-2 bg-zinc-200 rounded-full"></div> 将来</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-[5px] gap-y-[10px] md:gap-[6px] justify-start content-start">
            {Array.from({ length: totalDays }).map((_, index) => {
              const status = getDotStatus(index);
              let dotStyle = status === 'past' ? "bg-zinc-900" : status === 'urgent' ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)] animate-pulse-slow scale-110" : "bg-zinc-200";
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