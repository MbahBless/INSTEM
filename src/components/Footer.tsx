import React from "react";
import { Mail, MessageSquare, Briefcase, Globe, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-neutral-900 text-neutral-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-yellow-500/20">
              <Briefcase className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="font-display text-lg font-bold text-white tracking-widest uppercase">
              IN<span className="text-yellow-500">STEM</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-4">
            A state-of-the-art centralization matrix bridging Student development with industrial companies and higher academic supervision channels.
          </p>
        </div>

        <div>
          <h4 className="text-white font-display text-xs font-semibold uppercase tracking-widest mb-4">
            Institutional Contacts
          </h4>
          <ul className="space-y-3 text-xs">
            <li>
              <a
                href="mailto:lechindemmbah@gmail.com"
                className="flex items-center gap-2 hover:text-yellow-500 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-yellow-500" />
                lechindemmbah@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/237653293486"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-yellow-500 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-yellow-500" />
                +237 653 293 486
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-yellow-500" />
              <span>Cameroon, Central Africa</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-display text-xs font-semibold uppercase tracking-widest mb-4">
            INSTEM Standards
          </h4>
          <p className="text-xs text-neutral-500 leading-relaxed mb-3">
            Fully compliant with university internship regulations, providing transparent audit trails, periodic performance logs, and responsive applications workflows.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-yellow-500">
              STABLE VER. 2.9
            </span>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-white">
              SaaS SECURE
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600">
        <p>© 2026 INSTEM Digital Platforms. All Rights Reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted with 
          <span className="text-yellow-500">✦</span> 
          for Modern Educational Ecosystems.
        </p>
      </div>
    </footer>
  );
}
