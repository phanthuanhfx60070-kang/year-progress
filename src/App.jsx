import React, { useState, useEffect } from 'react';

// 🔗 LIFT Token Contract Address
const LIFT_CONTRACT_ADDRESS = "0x47b93c2a0920BBe10eFc7854b8FD04a02E85d031";

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check-in & Token State
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [liftBalance, setLiftBalance] = useState(0); // Mock LIFT Balance

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    
    // Check if wallet is already connected
    checkIfWalletIsConnected();

    return () => clearInterval(timer);
  }, []);

  // --- Web3 Logic (Native window.ethereum) ---
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
        alert("请先安装 MetaMask 钱包!");
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

  // --- Token Claim Logic (Mocking Smart Contract Interaction) ---
  const handleDailyCheckIn = async () => {
    // If not connected, connect first
    if (!walletAddress) {
      connectWallet();
      return;
    }

    setCheckInLoading(true);

    try {
      // ---------------------------------------------------------
      // 🔗 真实合约交互逻辑示例 (Real Contract Logic)
      // ---------------------------------------------------------
      /*
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(LIFT_CONTRACT_ADDRESS, ['function checkIn() public'], signer);
      
      console.log("Interacting with contract:", LIFT_CONTRACT_ADDRESS);
      const tx = await contract.checkIn(); 
      await tx.wait(); 
      */
      
      // 模拟 (Simulate)
      setTimeout(() => {
        setIsCheckedInToday(true);
        setLiftBalance(prev => prev + 10);
        setCheckInLoading(false);
      }, 1500);

    } catch (error) {
      console.error("Claim Failed:", error);
      setCheckInLoading(false);
    }
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  // --- Date Logic ---
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

  // Components for Buttons
  const WalletButton = () => (
    !walletAddress ? (
      <button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-white border-2 border-zinc-100 text-zinc-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-zinc-50 hover:border-zinc-200 active:scale-95 transition-all duration-300 shadow-sm"
      >
        {isConnecting ? (
          <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
        )}
        连接钱包
      </button>
    ) : (
      <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-full text-sm font-semibold text-zinc-600 cursor-default shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span className="font-mono">{formatAddress(walletAddress)}</span>
        {liftBalance > 0 && (
          <span className="ml-1 text-amber-500 font-bold">({liftBalance} LIFT)</span>
        )}
      </div>
    )
  );

  // Vertical Check-in Button (Minimalist Text Only)
  const CheckInAction = () => {
    // Base style for the vertical pill
    const baseClass = "group w-14 md:w-16 h-full rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 active:scale-95 border";
    
    // CASE 1: Checked In (Token Claimed State)
    if (isCheckedInToday) {
      return (
        <div className={`${baseClass} bg-amber-50 border-amber-100 text-amber-600 cursor-default animate-fade-in`}>
          <div className="flex flex-col text-sm md:text-base font-bold tracking-widest leading-tight opacity-90 text-center gap-1">
            <span>已</span>
            <span>领</span>
          </div>
        </div>
      );
    }

    // CASE 2: Not Checked In (Claim Action)
    return (
      <button
        onClick={handleDailyCheckIn}
        disabled={checkInLoading}
        className={`${baseClass} bg-rose-500 border-rose-500 text-white hover:bg-rose-600 hover:shadow-rose-200/50 hover:scale-[1.02]`}
      >
        <div className="flex flex-col text-lg md:text-xl font-bold tracking-widest leading-tight gap-2">
          {checkInLoading ? (
            <span className="text-base">...</span>
          ) : (
            <>
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
      
      {/* --- Main Card Container --- */}
      <div className="w-full max-w-3xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-zinc-200/50 p-6 md:p-10 transition-all duration-500 flex flex-col min-h-[90vh] md:min-h-auto justify-between gap-6">
        
        {/* Top Section Wrapper */}
        <div>
          {/* Header */}
          <header className="flex flex-col gap-6 mb-8 border-b border-zinc-100 pb-6 md:flex-row md:items-start md:justify-between">
            {/* Date Info */}
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

            {/* Wallet Action Area */}
            <div className="flex items-center justify-between md:flex-col md:items-end md:gap-2 md:pt-2">
               <WalletButton />
            </div>
          </header>

          {/* --- MIDDLE ROW: Month Selector + Check-in Button --- */}
          <div className="mb-8 flex gap-4 md:gap-6 items-stretch">
            {/* Left: Months (Flexible Width) */}
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

            {/* Right: Check-in Button (Auto Height) */}
            <div className="shrink-0">
               <CheckInAction />
            </div>
          </div>
        </div>

        {/* --- Core Content: Grid --- */}
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

        {/* Bottom Stats */}
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
        {walletAddress ? 'WEB3 CONNECTED • TIME IS MONEY' : 'TIME SCALE • 活在当下'}
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}@keyframes pulse-slow{0%,100%{opacity:1;transform:scale(1.1)}50%{opacity:0.8;transform:scale(1)}}.animate-pulse-slow{animation:pulse-slow 4s cubic-bezier(0.4,0,0.6,1) infinite}@keyframes fade-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in{animation:fade-in 0.3s ease-out}`}</style>
    </div>
  );
};

export default App;