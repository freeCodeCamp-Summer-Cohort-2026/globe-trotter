"use client";

import { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";

export interface TabItem {
	value: string,
	label: string,
	content?: ReactNode,
	disabled?: boolean,
};

export interface ModuleTabsProps {
	tabs: TabItem[],
	activeTab: string,
	onChange: (value: string) => void,
};

export const ModuleTabs = ({ tabs, activeTab, onChange }: ModuleTabsProps) => (
	<Tabs.Root className="ui:w-full ui:max-w-7xl ui:mx-auto ui:px-4 ui:sm:px-6 ui:md:px-8 ui:lg:px-12 ui:xl:px-0" value={activeTab} onValueChange={onChange}>
		<Tabs.List className="ui:flex ui:w-full ui:mx-auto ui:items-center ui:gap-6 ui:border-b ui:border-slate-200" aria-label="See All Tutorials or All Labs">
			{tabs.map((tab) => (
				<Tabs.Trigger
					key={tab.value}
					value={tab.value}
					disabled={tab.disabled}
					className="ui:border-b-2 ui:border-transparent ui:px-1 ui:py-3 ui:text-sm ui:font-medium ui:text-[#0D74CE] ui:transition-colors ui:hover:text-slate-900 ui:focus-visible:outline-2 ui:focus-visible:outline-offset-2 ui:data-[state=active]:border-slate-900 ui:data-[state=active]:text-slate-900 ui:disabled:cursor-not-allowed ui:disabled:opacity-50" >
					{tab.label}
				</Tabs.Trigger>
			))}
		</Tabs.List>
		{tabs.map((tab) => (
			<Tabs.Content
				key={tab.value}
				value={tab.value} >
				{tab.content}
			</Tabs.Content>
		))}
	</Tabs.Root>
);


ModuleTabs.displayName = "ModuleTabs";