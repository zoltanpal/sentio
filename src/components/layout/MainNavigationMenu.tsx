import { useLocation } from "react-router-dom";
import { InfoIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/shared/ui/navigation-menu"

const components: {
    title: string;
    href: string;
    icon: React.ElementType;
  }[] = [
    { title: "How it works", href: "/help", icon: InfoIcon },
];

export function MainNavigationMenu() {
  const location = useLocation()

  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center gap-3 whitespace-nowrap">
        {components.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href)

          return (
            <NavigationMenuLink asChild>
              <a
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-gray-600 transition-colors ${
                  isActive
                    ? "text-gray-900 underline underline-offset-2"
                    : "hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{item.title}</span>
              </a>
            </NavigationMenuLink>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}