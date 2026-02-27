"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Wallet,
    FileText,
} from "lucide-react";

type Route = {
    label: string;
    icon: any;
    href: string;
    subRoutes?: { label: string; href: string }[];
};

const routes: Route[] = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Inventory",
        icon: Package,
        href: "/inventory",
        subRoutes: [
            { label: "Products", href: "/inventory/products" },
            { label: "Stock Movements", href: "/inventory/movements" },
        ]
    },
    {
        label: "Sales",
        icon: ShoppingCart,
        href: "/sales",
        subRoutes: [
            { label: "Orders / Invoices", href: "/sales/orders" },
            { label: "Customers", href: "/sales/customers" },
        ]
    },
    {
        label: "Purchases",
        icon: Truck,
        href: "/purchases",
        subRoutes: [
            { label: "Purchase Orders", href: "/purchases/orders" },
            { label: "Suppliers", href: "/purchases/suppliers" },
        ]
    },
    {
        label: "Finance",
        icon: Wallet,
        href: "/finance",
        subRoutes: [
            { label: "Transactions", href: "/finance/transactions" },
            { label: "Accounts", href: "/finance/accounts" },
        ]
    },
    {
        label: "Reports",
        icon: FileText,
        href: "/reports",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white overflow-y-auto w-64">
            <div className="px-3 py-2">
                <Link href="/dashboard" className="flex items-center pl-3 mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        ERP System
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <div key={route.href}>
                            <Link
                                href={route.subRoutes ? route.subRoutes[0].href : route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                    pathname.startsWith(route.href) ? "text-white bg-white/10" : "text-slate-400"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3")} />
                                    {route.label}
                                </div>
                            </Link>

                            {/* Render sub-routes if they exist and we are within that module section */}
                            {route.subRoutes && pathname.startsWith(route.href) && (
                                <div className="pl-11 mt-1 space-y-1 mb-2">
                                    {route.subRoutes.map((subRoute) => (
                                        <Link
                                            key={subRoute.href}
                                            href={subRoute.href}
                                            className={cn(
                                                "border-l border-slate-700 block px-4 py-2 text-sm transition-colors hover:text-white hover:border-slate-400",
                                                pathname === subRoute.href || pathname.startsWith(subRoute.href + "/")
                                                    ? "text-white border-white"
                                                    : "text-slate-500"
                                            )}
                                        >
                                            {subRoute.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
