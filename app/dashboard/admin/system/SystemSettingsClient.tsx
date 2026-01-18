/**
 * 系統設定客戶端元件（重新設計版）
 * 統一設計語言、清晰分組、Tab 導航
 */
'use client';

import React, { useState } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import CoreServicesConfig from './sections/CoreServicesConfig';
import ThirdPartyIntegrationConfig from './sections/ThirdPartyIntegrationConfig';
import MCPSettings from './sections/MCPSettings';
import AgentSkillsSettings from './sections/AgentSkillsSettings';
import {
  Zap,
  Server,
  BrainCircuit,
  Wrench
} from 'lucide-react';

interface Props {
  dict: Dictionary;
}

type TabType = 'core' | 'integration' | 'mcp' | 'skills';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function SystemSettingsClient({ dict }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('core');

  const tabs: Tab[] = [
    {
      id: 'core',
      label: '核心服務',
      icon: <Zap size={18} />,
      description: 'AI 模型與儲存配置'
    },
    {
      id: 'integration',
      label: '第三方整合',
      icon: <Server size={18} />,
      description: '通知與外部服務'
    },
    {
      id: 'mcp',
      label: 'MCP 設定',
      icon: <Wrench size={18} />,
      description: 'MCP Servers 與 API Keys'
    },
    {
      id: 'skills',
      label: 'Agent Skills',
      icon: <BrainCircuit size={18} />,
      description: '管理 Agent 技能包'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-white/5 border border-transparent'
                  }
                  min-w-fit whitespace-nowrap
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'core' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
                <Zap size={20} className="text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                  核心服務配置
                </h2>
                <p className="text-xs text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  AI 模型與儲存空間設定
                </p>
              </div>
            </div>
            <CoreServicesConfig dict={dict} />
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Server size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                  第三方整合服務
                </h2>
                <p className="text-xs text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  通知與外部 API 設定
                </p>
              </div>
            </div>
            <ThirdPartyIntegrationConfig dict={dict} />
          </div>
        )}

        {activeTab === 'mcp' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Wrench size={20} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                  MCP 設定
                </h2>
                <p className="text-xs text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  管理 MCP Servers 與其他工具 API Keys
                </p>
              </div>
            </div>
            <MCPSettings dict={dict} />
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <BrainCircuit size={20} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                  Agent Skills 設定
                </h2>
                <p className="text-xs text-text-tertiary uppercase tracking-widest mt-0.5 opacity-60">
                  管理系統層級 Agent 技能包
                </p>
              </div>
            </div>
            <AgentSkillsSettings dict={dict} />
          </div>
        )}
      </div>
    </div>
  );
}
