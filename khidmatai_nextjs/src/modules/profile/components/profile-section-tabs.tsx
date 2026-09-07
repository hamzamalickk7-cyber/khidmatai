"use client";

import type { LucideIcon } from "lucide-react";

export interface ProfileSectionTabDefinition<TabKey extends string> {
  key: TabKey;
  label: string;
  IconComponent: LucideIcon;
}

interface ProfileSectionTabsProperties<TabKey extends string> {
  tabList: readonly ProfileSectionTabDefinition<TabKey>[];
  activeTabKey: TabKey;
  onTabChange: (tabKey: TabKey) => void;
}

export function ProfileSectionTabs<TabKey extends string>({
  tabList,
  activeTabKey,
  onTabChange,
}: ProfileSectionTabsProperties<TabKey>) {
  return (
    <div
      className="border-ink/10 bg-background/95 sticky top-16 z-30 -mx-4 overflow-x-auto border-b px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      role="tablist"
      aria-label="Profile sections"
    >
      <div className="flex min-w-max gap-1">
        {tabList.map(({ key, label, IconComponent }) => {
          const isActive = key === activeTabKey;

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`profile-tab-panel-${key}`}
              id={`profile-tab-${key}`}
              onClick={() => onTabChange(key)}
              className={`focus-visible:outline-brand relative flex h-12 items-center gap-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${
                isActive ? "text-brand" : "text-ink/50 hover:text-ink"
              }`}
            >
              <IconComponent className="size-4" aria-hidden="true" />
              {label}
              {isActive && <span className="bg-brand absolute inset-x-3 bottom-0 h-0.5 rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
