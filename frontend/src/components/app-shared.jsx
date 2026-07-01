export const navGroups = [
	{
		label: "Explore",
		items: [
			{
				title: "Dashboard",
				path: "#/overview",
				icon: (
					<IconPlaceholder
                        hugeicons="DashboardSquare01Icon"
                        lucide="LayoutDashboardIcon"
                        phosphor="SquaresFourIcon"
                        remixicon="RiDashboardLine"
                        tabler="IconLayoutDashboard" />
				),
				isActive: true,
			},
			{
				title: "Events",
				path: "#/events",
				icon: (
					<IconPlaceholder
                        hugeicons="Cursor02Icon"
                        lucide="MousePointerClickIcon"
                        phosphor="CursorClickIcon"
                        remixicon="RiCursorLine"
                        tabler="IconPointer" />
				),
			},
			{
				title: "Funnels",
				path: "#/funnels",
				icon: (
					<IconPlaceholder
                        hugeicons="FilterIcon"
                        lucide="FunnelIcon"
                        phosphor="FunnelIcon"
                        remixicon="RiFilterLine"
                        tabler="IconChartFunnel" />
				),
			},
			{
				title: "Retention",
				path: "#/retention",
				icon: (
					<IconPlaceholder
                        hugeicons="RepeatIcon"
                        lucide="RepeatIcon"
                        phosphor="RepeatIcon"
                        remixicon="RiRepeatLine"
                        tabler="IconRepeat" />
				),
			},
			{
				title: "Flows",
				path: "#/flows",
				icon: (
					<IconPlaceholder
                        hugeicons="GitBranchIcon"
                        lucide="GitBranchIcon"
                        phosphor="GitBranchIcon"
                        remixicon="RiGitBranchLine"
                        tabler="IconGitBranch" />
				),
			},
		],
	},
	{
		label: "Audiences",
		items: [
			{
				title: "Segments",
				path: "#/segments",
				icon: (
					<IconPlaceholder
                        hugeicons="UserGroupIcon"
                        lucide="UsersIcon"
                        phosphor="UsersThreeIcon"
                        remixicon="RiGroupLine"
                        tabler="IconUsersGroup" />
				),
			},
			{
				title: "Cohorts",
				path: "#/cohorts",
				icon: (
					<IconPlaceholder
                        hugeicons="PieChartIcon"
                        lucide="ChartPieIcon"
                        phosphor="ChartPieIcon"
                        remixicon="RiPieChartLine"
                        tabler="IconChartPie" />
				),
			},
			{
				title: "Profiles",
				path: "#/profiles",
				icon: (
					<IconPlaceholder
                        hugeicons="UserIcon"
                        lucide="UserIcon"
                        phosphor="UserIcon"
                        remixicon="RiUserLine"
                        tabler="IconUser" />
				),
			},
		],
	},
	{
		label: "Configure",
		items: [
			{
				title: "Integrations",
				path: "#/integrations",
				icon: (
					<IconPlaceholder
                        hugeicons="Plug01Icon"
                        lucide="PlugIcon"
                        phosphor="PlugIcon"
                        remixicon="RiPlugLine"
                        tabler="IconPlug" />
				),
			},
		],
	},
];

export const navLinks = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item])),
];
