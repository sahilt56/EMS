import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { navLinks } from "@/components/app-shared";
import { CustomTrigger } from "@/components/custom-trigger";
import { NavUser } from "@/components/nav-user";

export function AppHeader() {
	const activeItem = navLinks.find((item) => item.isActive);

	return (
        <header
            className="sticky top-0 z-50 flex h-(--app-header-height) w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-3">
				<CustomTrigger place="navbar" />
			</div>
            <Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>{activeItem?.title}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>{" "}
            <div className="flex items-center gap-3">
				<Button size="icon-sm" variant="outline">
					<IconPlaceholder
                        hugeicons="HelpCircleIcon"
                        lucide="HelpCircleIcon"
                        phosphor="QuestionIcon"
                        remixicon="RiQuestionLine"
                        tabler="IconHelpCircle" />
				</Button>
				<Button aria-label="Notifications" size="icon-sm" variant="outline">
					<IconPlaceholder
                        hugeicons="Notification03Icon"
                        lucide="BellIcon"
                        phosphor="BellIcon"
                        remixicon="RiNotification3Line"
                        tabler="IconBell" />
				</Button>
				<Separator
                    className="h-4 data-[orientation=vertical]:self-center"
                    orientation="vertical" />
				<NavUser />
			</div>
        </header>
    );
}
