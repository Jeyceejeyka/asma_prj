import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { apiHealth } from "@/lib/api";

const AUTO_HIDE_SECONDS = 8;

const BackendStatus = () => {
  const [online, setOnline] = useState(apiHealth.online);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_HIDE_SECONDS);
  const [visible, setVisible] = useState(true);

  useEffect(() => apiHealth.subscribe(setOnline), []);

  useEffect(() => {
    if (online) return;

    setVisible(true);
    setSecondsLeft(AUTO_HIDE_SECONDS);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [online]);

  if (online || !visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-xl border border-amber-500/20 bg-background/95 backdrop-blur-md p-4 shadow-lg flex gap-3 items-start">
      <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />

      <div className="text-sm">
        <p className="font-semibold">Connection temporarily unavailable</p>
        <p className="text-muted-foreground mt-2">
          This message will close in <span className="font-medium">{secondsLeft}s</span>
        </p>
      </div>
    </div>
  );
};

export default BackendStatus;