import React, { useState, useEffect } from 'react';

export const DecryptText = () => {
  const targetText = "Kenjiro's Portfolio. Let's enjoy hacking!!";
  const [displayText, setDisplayText] = useState("");
  const chars = "!@#$%^&*()_+-=[]{}|;':\",.<>/?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        targetText.split("")
          .map((char, index) => {
            if (index < iteration) {
              return targetText[index]; // すでに確定した文字
            }
            return chars[Math.floor(Math.random() * chars.length)]; // ランダムな文字
          })
          .join("")
      );

      iteration += 1 / 3; // 速度の調整（値を小さくするとゆっくりになります）
      
      if (iteration >= targetText.length) {
        clearInterval(interval);
        setDisplayText(targetText);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

return (
  <div className="flex items-center justify-start h-full">
    <div className="
      font-mono font-black 
      text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem]
      tracking-tighter 
      text-[#00FF00] 
      leading-none
    ">
      {displayText}
      <span className="cursor-blink border-l-8 border-[#00FF00] ml-2">&nbsp;</span>
    </div>
  </div>
);
};