"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const getTodayDate = () => new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState({ date: getTodayDate(), description: "", type: "income", amount: 0, cash_account_id: "" });

    // Queries
    const { data: transactions = [], isLoading: loadingTx } = useQuery({
        queryKey: ["journal-transactions"],
        queryFn: async () => {
            const res = await apiClient.get("/finance/transactions");
            return res.data;
        }
    });

    const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
        queryKey: ["cash-accounts"],
        queryFn: async () => {
            const res = await apiClient.get("/finance/accounts");
            return res.data.filter((a: any) => a.is_active);
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newTx: any) => {
            const res = await apiClient.post("/finance/transactions", newTx);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["journal-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] }); // refresh balances
            setIsAddOpen(false);
            setFormData({ date: getTodayDate(), description: "", type: "income", amount: 0, cash_account_id: "" });
        }
    });

    const filtered = transactions.filter(
        (tx: any) =>
            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.id.toString().includes(searchTerm)
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.cash_account_id) return;

        createMutation.mutate({
            date: formData.date,
            description: formData.description,
            type: formData.type,
            amount: Number(formData.amount),
            cash_account_id: parseInt(formData.cash_account_id)
        });
    };

    if (loadingTx || loadingAccounts) return <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>;

    const getAccountName = (id: number) => {
        const acc = accounts.find((a: any) => a.id === id);
        return acc ? acc.name : `Account #${id}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Journal Transactions</h2>
                    <p className="text-muted-foreground">Record and track your business expenses and incomes.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setFormData({ date: getTodayDate(), description: "", type: "income", amount: 0, cash_account_id: "" })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Journal Entry</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input id="desc" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Transaction Type</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount ($)</Label>
                                    <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account">Cash Account</Label>
                                <Select value={formData.cash_account_id} onValueChange={(value) => setFormData({ ...formData, cash_account_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.length === 0 && <SelectItem value="0" disabled>No active accounts available</SelectItem>}
                                        {accounts.map((acc: any) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || !formData.cash_account_id}>{createMutation.isPending ? "Saving..." : "Save Entry"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((tx: any) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-medium text-muted-foreground">TRX-{tx.id.toString().padStart(4, '0')}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm">
                                            <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                                            {tx.date}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{tx.description}</TableCell>
                                    <TableCell>{getAccountName(tx.cash_account_id)}</TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
