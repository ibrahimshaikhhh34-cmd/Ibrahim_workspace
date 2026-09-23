import { useState } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { TabNav, TABS } from "@/components/TabNav";
import ProjectTracker from "@/pages/ProjectTracker";
import ModelPrep from "@/pages/ModelPrep";
import LogReader from "@/pages/LogReader";
import TemplateBuilder from "@/pages/TemplateBuilder";
import DataBuilder from "@/pages/DataBuilder";

const PAGES = {
  tracker: ProjectTracker,
  "model-prep": ModelPrep,
  "log-reader": LogReader,
  "template-builder": TemplateBuilder,
  "data-builder": DataBuilder,
};

function App() {
  const [active, setActive] = useState("tracker");
  const Page = PAGES[active];
  const meta = TABS.find((t) => t.id === active);

  return (
    <div className="App min-h-screen pb-24 md:pb-10">
      <header data-testid="app-header" className="sticky top-0 z-40 border-b border-[#2A364F] bg-[#0B0F17]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-sm bg-[#F59E0B] flex items-center justify-center font-display font-bold text-[#0B0F17] text-lg">
                SC
              </div>
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide leading-none">
                  SC2 Mod Command Center
                </h1>
                <p className="text-xs uppercase tracking-widest text-[#6B7280] mt-1 hidden sm:block">
                  Survivalcraft 2 · modding toolkit
                </p>
              </div>
            </div>
            <a
              data-testid="source-zip-link"
              href={`${process.env.REACT_APP_BACKEND_URL}/api/source-zip`}
              className="text-xs font-mono text-[#F59E0B] uppercase tracking-widest hover:text-[#F3F4F6] hidden sm:inline"
            >
              Download source .zip
            </a>
          </div>
          <TabNav active={active} onChange={setActive} variant="top" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <div key={active} className="rise">
          <Page />
        </div>
      </main>

      <TabNav active={active} onChange={setActive} variant="bottom" />
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
}

export default App;
