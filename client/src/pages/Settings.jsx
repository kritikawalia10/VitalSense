import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Palette, Moon, Sun, MonitorSmartphone } from 'lucide-react';

const Settings = () => {
  const { theme, customColor, changeTheme, changeCustomColor } = useContext(ThemeContext);

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Cyan', value: '#06b6d4' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Customize your application experience.</p>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 space-y-10">
        
        {/* Theme Selection */}
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <MonitorSmartphone size={20} className="text-primary" />
            Appearance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => changeTheme('dark')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                theme === 'dark' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <Moon size={24} className="text-slate-300" />
              </div>
              <span className="font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Dark Mode</span>
            </button>

            <button
              onClick={() => changeTheme('light')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                theme === 'light' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <Sun size={24} className="text-slate-600" />
              </div>
              <span className="font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Light Mode</span>
            </button>

            <button
              onClick={() => changeTheme('custom')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                theme === 'custom' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Palette size={24} className="text-white" />
              </div>
              <span className="font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Custom Theme</span>
            </button>
          </div>
        </div>

        {/* Custom Color Selection (Only visible if Custom Theme is active) */}
        {theme === 'custom' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 mb-4">
              Accent Color
            </h3>
            <div className="flex flex-wrap gap-4">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => changeCustomColor(c.value)}
                  className={`w-12 h-12 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                    customColor === c.value ? 'ring-4 ring-offset-2 ring-offset-slate-950 dark:ring-offset-slate-950 light:ring-offset-white' : ''
                  }`}
                  style={{ backgroundColor: c.value, '--tw-ring-color': c.value }}
                  title={c.name}
                >
                  {customColor === c.value && <div className="w-4 h-4 bg-white rounded-full" />}
                </button>
              ))}
              <div className="relative">
                <input 
                  type="color" 
                  value={customColor} 
                  onChange={(e) => changeCustomColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  title="Pick a custom color"
                />
                <div 
                  className="w-12 h-12 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center"
                  style={{ backgroundColor: customColor }}
                >
                  <Palette size={20} className="text-white mix-blend-difference" />
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3">Select a preset color or pick your own custom accent color.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
