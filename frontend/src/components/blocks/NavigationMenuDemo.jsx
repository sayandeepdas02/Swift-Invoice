import * as React from "react"
import { Link } from "react-router-dom"
import { Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components = [
  {
    title: "Invoices",
    href: "/dashboard",
    description:
      "Create, edit, and manage your professional invoices with our fast builder.",
  },
  {
    title: "Clients",
    href: "/clients",
    description:
      "Manage your client details, addresses, and email contacts in one place.",
  },
  {
    title: "History",
    href: "/history",
    description:
      "View all past invoices, track statuses, and download PDFs on demand.",
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Configure your branding, default notes, and tax percentages.",
  },
]

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-[300px] md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-slate-50 border border-slate-100 p-6 no-underline outline-none focus:shadow-md"
                    to="/"
                  >
                    <Zap className="h-6 w-6 text-brand-base mb-2" />
                    <div className="mb-2 mt-2 text-lg font-semibold text-text-primary">
                      Swift Invoice
                    </div>
                    <p className="text-sm leading-tight text-text-secondary">
                      Professional invoicing platform for freelancers and creative agencies.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem to="/#features" title="Features">
                Instant generation, PDF exports, custom branding, and more.
              </ListItem>
              <ListItem to="/#pricing" title="Pricing">
                Transparent pricing plans for individuals and teams.
              </ListItem>
              <ListItem to="/#testimonials" title="Testimonials">
                See what independent professionals are saying about us.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  to={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/#pricing">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Pricing
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef(({ className, title, children, to, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 hover:text-text-primary focus:bg-slate-50 focus:text-text-primary text-text-primary",
            className
          )}
          to={to}
          {...props}
        >
          <div className="text-sm font-medium leading-none mb-2">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-text-secondary">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
