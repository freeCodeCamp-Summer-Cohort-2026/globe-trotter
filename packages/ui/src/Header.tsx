import { ReactNode } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import {
    Globe,
    CircleUser,
} from "lucide-react";

export interface HeaderLinkItem {
    id?: number,
    label?: string,
    href: string,
    icon?: ReactNode
};

export type HeaderVariant = "learner" | "content-author";

export interface HeaderUser {
    name?: string;
    email?: string;
    avatarUrl?: string;
};

export interface HeaderProps {
    brandName?: string,
    linkItems?: HeaderLinkItem[],
    variant?: HeaderVariant,
    user?: HeaderUser,
    renderLink?: (linkItem: HeaderLinkItem, children: ReactNode) => ReactNode,
};

const HeaderLinkItems: HeaderLinkItem[] = [
    { id: 1, label: "Home", href: "/" },
    { id: 2, label: "All Modules", href: "/" },
];

export const Header = ({ brandName = "Globe Trotter", linkItems = HeaderLinkItems, variant = "learner", user = { name: "username" }, renderLink = (linkItem, children) => <a href={linkItem.href}>{children}</a> }: HeaderProps) => {
    const brandChildren = (
        <div
            className="ui:flex ui:items-center ui:gap-2 ui:font-semibold ui:text-[#113264] ui:hover:text-[#0D74CE]" aria-label="Globe Trotter Brand"
        >
            <Globe
                className="ui:h-6 ui:w-6 ui:text-[#18794e] ui:hover:text-[#153226]"
                aria-hidden="true"
            />
            <span>{brandName}</span>
        </div>
    );

    return (
        <header className="ui:sticky ui:top-0 ui:z-50 ui:w-full ui:border-b ui:border-slate-200 ui:bg-white">
            <NavigationMenu.Root className="ui:max-w-7xl ui:mx-auto ui:px-4 ui:sm:px-6 ui:md:px-8 ui:lg:px-12 ui:xl:px-0">
                <NavigationMenu.List className="ui:flex ui:h-16 ui:items-center ui:justify-between ui:gap-4 sm:ui:gap-6 lg:ui:gap-8">
                    <NavigationMenu.Item>
                        {renderLink({ id: 0, label: brandName, href: "/" }, brandChildren)}
                    </NavigationMenu.Item>

                    <div className="ui:flex ui:items-center ui:gap-6 ui:text-[#113264] ui:hover:text-[#0D74CE]">
                        {
                            (variant === "learner" || variant === "content-author") &&
                            linkItems.map((linkItem) => {
                                const linkChildren = (
                                    <span className="ui:text-sm ui:font-medium ui:px-3 ui:py-2 ui:text-[#113264] ui:hover:text-[#0D74CE]">
                                        {linkItem.label}
                                    </span>
                                );
                                return (
                                    <NavigationMenu.Item key={linkItem.id}>
                                        {renderLink(linkItem, linkChildren)}
                                    </NavigationMenu.Item>
                                )
                            })
                        }

                        <NavigationMenu.Item className="ui:relative">
                            <NavigationMenu.Trigger className="ui:flex ui:justify-end ui:gap-2 ui:font-medium ui:text-[#113264] ui:hover:text-[#0D74CE]">
                                <CircleUser aria-hidden="true" /> {user.name}
                            </NavigationMenu.Trigger>
                            <NavigationMenu.Content className="ui:absolute ui:top-0 ui:right-0  ui:bg-slate-50 ui:w-40 ui:rounded ui:p-4 ui:my-8">
                                <ul>
                                    <li>One</li>
                                    <li>Two</li>
                                    <li>Three</li>
                                </ul>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                    </div>
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </header >
    );
};

Header.displayName = "Header";