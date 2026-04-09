import { useLocation } from "react-router-dom"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/shared/ui/navigation-menu"

const components: { title: string; href: string }[] = [
  // { title: "Home", href: "/" },
  { title: "Dashboard", href: "/results" },
  { title: "About", href: "/about" },
  { title: "Help", href: "/help" },
]

export function MainNavigationMenu() {
  const location = useLocation()

  return (
    <NavigationMenu>
      <NavigationMenuList className="flex gap-4">
        {components.map((item) => {
          const isActive =
            item.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href)

          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                href={item.href}
                className={`text-sm font-semibold text-gray-600 transition-colors ${
                  isActive
                    ? "text-gray-900 underline underline-offset-2"
                    : "hover:text-gray-900"
                }`}
              >
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}