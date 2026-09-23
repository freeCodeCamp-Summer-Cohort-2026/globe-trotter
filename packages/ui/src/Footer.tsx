import { ReactNode } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

export interface FooterLinkItem {
    id: number,
    label: string,
    href: string
};

export interface FooterProps {
    linkItems?: FooterLinkItem[],
    renderLink?: (linkItem: FooterLinkItem, children: ReactNode) => ReactNode,
};

const FooterlinkItems: FooterLinkItem[] = [
    { id: 1, label: "Privacy Policy", href: "/" },
    { id: 2, label: "Terms of Service", href: "/" },
    { id: 3, label: "Knowledge Base", href: "/" },
];

export const Footer = ({ linkItems = FooterlinkItems, renderLink = (linkItem, children) => <a href={linkItem.href}>{children}</a> }: FooterProps) => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="ui:w-full ui:border-t ui:border-slate-200 ui:bg-[#F9F9FB]">
            <div className="ui:max-w-7xl ui:mx-auto ui:flex ui:items-center ui:justify-between ui:gap-3 ui:px-4 ui:sm:px-6 ui:md:px-8 ui:lg:px-12 ui:xl:px-0 ui:py-6">
                <p className="ui:py-2 ui:my-0 ui:text-sm ui:text-[#8B8D98]">
                    Copyright &copy;{currentYear} Globe Trotter. All rights reserved.
                </p>
                <NavigationMenu.Root>
                    <NavigationMenu.List className="ui:flex ui:gap-4">
                        {
                            linkItems.map((linkItem) => {
                                const linkChildren = (

                                    <span className="ui:pl-6 ui:py-2 ui:text-sm ui:text-[#8B8D98] ui:hover:text-[#60646C]">
                                        {linkItem.label}
                                    </span>
                                );
                                return (
                                    <NavigationMenu.Item key={linkItem.id} >
                                            {renderLink(linkItem, linkChildren)}
                                    </NavigationMenu.Item>
                                )
                            })
                        }
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>
        </footer>
    );
};

Footer.displayName = "Footer";