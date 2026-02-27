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
import { Plus, Wallet, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";

export default function AccountsPage() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
    const [formData, setFormData] = useState({ name: "", type: "bank", balance: 0, is_active: true });

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ["cash-accounts"],
        queryFn: async () => {
            const res = await apiClient.get("/finance/accounts");
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newAccount: any) => {
            const res = await apiClient.post("/finance/accounts", newAccount);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
            setIsAddOpen(false);
            setFormData({ name: "", type: "bank", balance: 0, is_active: true });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: any }) => {
            const res = await apiClient.put(`/finance/accounts/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
            setIsEditOpen(false);
            setSelectedAccount(null);
        }
    });

    const totalBalance = accounts.reduce((sum: number, acc: any) => sum + (acc.is_active ? acc.balance : 0), 0);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            name: formData.name,
            type: formData.type,
            balance: Number(formData.balance),
            is_active: formData.is_active
        });
    };

    const openEdit = (account: any) => {
        setSelectedAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            is_active: account.is_active
        });
        setIsEditOpen(true);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount) return;
        updateMutation.mutate({
            id: selectedAccount.id,
            data: {
                name: formData.name,
                type: formData.type,
                balance: Number(formData.balance),
                is_active: formData.is_active
            }
        });
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading accounts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Accounts & Balances</h2>
                    <p className="text-muted-foreground">Manage your bank and cash accounts.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setFormData({ name: "", type: "bank", balance: 0, is_active: true })}>
                                <Plus className="mr-2 h-4 w-4" /> Add Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Account</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Account Name</Label>
                                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. BCA Company" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Account Type</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank">Bank</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="ewallet">E-Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="balance">Initial Balance</Label>
                                    <Input id="balance" type="number" step="0.01" value={formData.balance} onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.is_active ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save"}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-900 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Total Available Balance (Active)</CardTitle>
                        <Wallet className="h-4 w-4 text-slate-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${totalBalance.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-white mt-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No accounts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            accounts.map((account: any) => (
                                <TableRow key={account.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {account.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{account.type}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${account.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {account.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">${account.balance.toFixed(2)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(account)}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Account ({selectedAccount?.name})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Account Name</Label>
                            <Input id="edit-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Account Type</Label>
                            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank">Bank</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-balance">Balance</Label>
                            <Input id="edit-balance" type="number" step="0.01" value={formData.balance} onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select value={formData.is_active ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Changes"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
