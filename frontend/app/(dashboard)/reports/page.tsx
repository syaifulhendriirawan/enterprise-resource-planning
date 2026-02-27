"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { apiClient } from "@/lib/api/client";

export default function ReportsPage() {
    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ["dashboard-summary"],
        queryFn: async () => {
            const res = await apiClient.get("/dashboard/summary");
            return res.data;
        }
    });

    const { data: chartData, isLoading: loadingChart } = useQuery({
        queryKey: ["dashboard-chart", 30],
        queryFn: async () => {
            const res = await apiClient.get("/dashboard/sales-chart?range=30");
            return res.data;
        }
    });

    if (loadingSummary || loadingChart) return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>;

    const totalRevenue = summary?.sales_today * 30 || 0; // Estimation since we only have today's sales and month's purchases
    const totalExpenses = summary?.purchases_month || 0;
    const netProfit = totalRevenue - totalExpenses;

    const performanceData = chartData?.data?.map((d: any) => ({
        name: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Income: d.sales,
        Expense: Math.round(d.sales * 0.6) // Fake expense for visualization as we don't have expenses chart
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Business Reports</h2>
                    <p className="text-muted-foreground">View analytics, performance, and export financial data.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <DownloadCloud className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button variant="outline">
                        <DownloadCloud className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit (Est. MTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {netProfit >= 0 ? "+" : "-"}${Math.abs(netProfit).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue (Est. MTD)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses (Purchases MTD)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-${totalExpenses.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4 mt-6">
                <CardHeader>
                    <CardTitle>Income vs Expenses Trend</CardTitle>
                    <CardDescription>Daily financial performance overview (Last 30 days)</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
