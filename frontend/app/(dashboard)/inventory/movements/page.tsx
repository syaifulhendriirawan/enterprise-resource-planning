"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowDownToLine, ArrowUpFromLine, History, Plus, Edit, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

type Movement = { id: string; date: string; product: string; type: string; qty: number; reference: string; user: string; notes?: string };

const mockMovements: Movement[] = [
    { id: "MOV-101", date: "2026-02-26", product: "Wireless Mouse", type: "IN", qty: 50, reference: "PO-2001", user: "Admin", notes: "Regular restock" },
    { id: "MOV-102", date: "2026-02-26", product: "Mechanical Keyboard", type: "OUT", qty: 2, reference: "INV-001", user: "Cashier" },
    { id: "MOV-103", date: "2026-02-25", product: "Monitor Arm", type: "ADJUST", qty: -1, reference: "Damage Report", user: "Manager", notes: "Found broken in warehouse" },
    { id: "MOV-104", date: "2026-02-24", product: "USB-C Cable", type: "OUT", qty: 5, reference: "INV-002", user: "Cashier" },
];

export default function StockMovementsPage() {
    const [movements, setMovements] = useState<Movement[]>(mockMovements);
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

    const getTodayDate = () => new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState({ date: getTodayDate(), product: "", type: "ADJUST", qty: 0, reference: "Manual Adjustment", notes: "" });

    const filtered = movements.filter(
        (item) =>
            item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const newMovement: Movement = {
            id: `MOV-${100 + movements.length + 1}`,
            user: "Current User",
            ...formData
        };
        setMovements([newMovement, ...movements]);
        setIsAddOpen(false);
        setFormData({ date: getTodayDate(), product: "", type: "ADJUST", qty: 0, reference: "Manual Adjustment", notes: "" });
    };

    const openEdit = (mov: Movement) => {
        setSelectedMovement(mov);
        setFormData({
            date: mov.date.split(" ")[0], // Simplify for date input
            product: mov.product,
            type: mov.type,
            qty: Math.abs(mov.qty),
            reference: mov.reference,
            notes: mov.notes || ""
        });
        setIsEditOpen(true);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMovement) return;
        setMovements(movements.map(m =>
            m.id === selectedMovement.id ? {
                ...m,
                ...formData,
                qty: formData.type === "OUT" || (formData.type === "ADJUST" && formData.qty < 0) ? -Math.abs(formData.qty) : Math.abs(formData.qty)
            } : m
        ));
        setIsEditOpen(false);
        setSelectedMovement(null);
    };

    const openDelete = (mov: Movement) => {
        setSelectedMovement(mov);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedMovement) return;
        setMovements(movements.filter(m => m.id !== selectedMovement.id));
        setIsDeleteOpen(false);
        setSelectedMovement(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Stock Movements</h2>
                    <p className="text-muted-foreground">Detailed history of all inventory in and out transactions.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setFormData({ date: getTodayDate(), product: "", type: "ADJUST", qty: 0, reference: "Manual Adjustment", notes: "" })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Adjustment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Stock Adjustment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product">Product Name</Label>
                                <Input id="product" placeholder="e.g. Wireless Mouse" value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IN">IN (+)</SelectItem>
                                            <SelectItem value="OUT">OUT (-)</SelectItem>
                                            <SelectItem value="ADJUST">ADJUST</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qty">Quantity</Label>
                                    <Input id="qty" type="number" value={formData.qty} onChange={e => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reference">Reason / Reference</Label>
                                <Input id="reference" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Adjustment</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items Received (Month)</CardTitle>
                        <ArrowDownToLine className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">350 pcs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items Sold (Month)</CardTitle>
                        <ArrowUpFromLine className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">142 pcs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Manual Adjustments</CardTitle>
                        <History className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">-5 pcs</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-2 max-w-sm mt-6">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by product or ref..."
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
                            <TableHead>Date / Time</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No stock movements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-muted-foreground">{item.date}</TableCell>
                                    <TableCell className="font-medium">{item.product}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold leading-none ${item.type === "IN"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.type === "OUT"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-orange-100 text-orange-700"
                                                }`}
                                        >
                                            {item.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`font-semibold ${item.type === "IN" ? "text-green-600" : item.type === "OUT" ? "text-blue-600" : "text-orange-600"
                                                }`}
                                        >
                                            {item.type === "IN" ? "+" : ""}{item.qty}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.reference}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{item.user}</TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDelete(item)}>
                                            <Trash className="h-4 w-4 text-destructive" />
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
                        <DialogTitle>Edit Movement ({selectedMovement?.id})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-date">Date</Label>
                            <Input id="edit-date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-product">Product Name</Label>
                            <Input id="edit-product" value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-type">Type</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IN">IN (+)</SelectItem>
                                        <SelectItem value="OUT">OUT (-)</SelectItem>
                                        <SelectItem value="ADJUST">ADJUST</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-qty">Quantity</Label>
                                <Input id="edit-qty" type="number" value={formData.qty} onChange={e => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-reference">Reason / Reference</Label>
                            <Input id="edit-reference" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Movement?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this movement (<span className="font-semibold">{selectedMovement?.id}</span>)? This will affect the calculated product stock levels and history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
