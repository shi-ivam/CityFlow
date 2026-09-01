import React from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';

export const RightSidepanel: React.FC = () => {
  return (
    <aside className="w-full h-full flex flex-col justify-center items-center p-8 bg-card border-l border-border select-none overflow-hidden font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Admin Portal Button */}
        <a
          href="/admin"
          className="w-full flex items-center justify-center gap-4 py-6 px-8 rounded-none bg-foreground text-background font-mono text-lg font-bold uppercase tracking-wider shadow-md hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer text-center border-2 border-foreground"
        >
          <ShieldCheck className="w-7 h-7 shrink-0" />
          <span>Admin Portal</span>
        </a>

        {/* Driver Portal Button */}
        <a
          href="/driver"
          className="w-full flex items-center justify-center gap-4 py-6 px-8 rounded-none bg-secondary text-foreground border-2 border-border font-mono text-lg font-bold uppercase tracking-wider hover:bg-accent hover:border-foreground/50 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer text-center shadow-sm"
        >
          <UserCheck className="w-7 h-7 shrink-0" />
          <span>Driver Portal</span>
        </a>
      </div>
    </aside>
  );
};

export default RightSidepanel;


