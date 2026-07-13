import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-[#C9B29F] text-sm flex items-center gap-1.5 bg-[#FFF8F5] px-3 py-1 rounded-full border border-[#F8B4C4]/40 shadow-sm">
      🕒 {time}
    </div>
  );
}
