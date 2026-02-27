"use client"

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { apiClient } from "@/lib/api/client";

export default function DashboardPage() {
    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ["dashboard", "summary"],
        queryFn: async () => {
            const res = await apiClient.get("/dashboard/summary");
            return res.data;
        }
    });

    const { data: lowStockItems, isLoading: loadingLowStock } = useQuery({
        queryKey: ["dashboard", "low-stock"],
        queryFn: async () => {
            const res = await apiClient.get("/dashboard/low-stock");
            return res.data;
        }
    });

    const { data: chartData, isLoading: loadingChart } = useQuery({
        queryKey: ["dashboard", "chart"],
        queryFn: async () => {
            const res = await apiClient.get("/dashboard/sales-chart");
            return res.data.data;
        }
    });

    const { data: recentSales, isLoading: loadingSales } = useQuery({
        queryKey: ["dashboard", "recent-sales"],
        queryFn: async () => {
            const res = await apiClient.get("/sales/orders");
            return res.data.slice(0, 5); // Take top 5 recent sales
        }
    });

    if (loadingSummary || loadingLowStock || loadingChart || loadingSales) {
        return <div className="p-8 text-center text-muted-foreground">Loading dashboard data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Summary Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (Today)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary?.sales_today?.toFixed(2) || "0.00"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Purchases (This Month)</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary?.purchases_month?.toFixed(2) || "0.00"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.low_stock_items || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bank Balance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary?.cash_balance?.toFixed(2) || "0.00"}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lowStockItems?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No low stock items.</p>
                            ) : (
                                lowStockItems?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium leading-none">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-destructive">{item.current_stock} left</p>
                                            <p className="text-xs text-muted-foreground">Min: {item.min_stock}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr className="border-b">
                                    <th className="h-10 px-4 text-left font-medium">Order Number</th>
                                    <th className="h-10 px-4 text-left font-medium">Customer</th>
                                    <th className="h-10 px-4 text-left font-medium">Status</th>
                                    <th className="h-10 px-4 text-right font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales?.map((sale: any) => (
                                    <tr key={sale.id} className="border-b">
                                        <td className="p-4 font-medium">{sale.order_number}</td>
                                        <td className="p-4">{sale.customer?.name || "Cash Customer"}</td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sale.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                                sale.status === 'unpaid' ? 'bg-red-100 text-red-800 border-red-200' :
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}>
                                                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-medium">${sale.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {recentSales?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-muted-foreground">No recent sales.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
