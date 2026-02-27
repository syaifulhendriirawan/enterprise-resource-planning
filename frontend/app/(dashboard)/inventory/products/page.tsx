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
import { Plus, Search, Edit, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
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
    SelectValue
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [formData, setFormData] = useState({ sku: "", name: "", category_id: 1, buy_price: 0, sell_price: 0, current_stock: 0, min_stock: 0 });

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await apiClient.get("/inventory/categories");
            return res.data;
        }
    });

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await apiClient.get("/inventory/products");
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newProduct: any) => {
            const res = await apiClient.post("/inventory/products", newProduct);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setIsAddOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedProduct: any) => {
            const res = await apiClient.put(`/inventory/products/${updatedProduct.id}`, updatedProduct);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setIsEditOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiClient.delete(`/inventory/products/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setIsDeleteOpen(false);
        }
    });

    const filteredProducts = products.filter(
        (product: any) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const openAdd = () => {
        // Find default category ID if available
        const defaultCat = categories.length > 0 ? categories[0].id : 1;
        setFormData({ sku: "", name: "", category_id: defaultCat, buy_price: 0, sell_price: 0, current_stock: 0, min_stock: 0 });
        setIsAddOpen(true);
    };

    const openEdit = (product: any) => {
        setSelectedProduct(product);
        setFormData({
            sku: product.sku,
            name: product.name,
            category_id: product.category_id,
            buy_price: product.buy_price,
            sell_price: product.sell_price,
            current_stock: product.current_stock,
            min_stock: product.min_stock
        });
        setIsEditOpen(true);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        updateMutation.mutate({ id: selectedProduct.id, ...formData });
    };

    const openDelete = (product: any) => {
        setSelectedProduct(product);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedProduct) return;
        deleteMutation.mutate(selectedProduct.id);
    };

    if (isLoading) return <div className="p-8 text-center">Loading products...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">Manage your product inventory and stock levels.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAdd}>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input id="sku" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={formData.category_id.toString()} onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="buy">Buy Price ($)</Label>
                                    <Input id="buy" type="number" step="0.01" value={formData.buy_price || ""} onChange={e => setFormData({ ...formData, buy_price: parseFloat(e.target.value) || 0 })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sell">Sell Price ($)</Label>
                                    <Input id="sell" type="number" step="0.01" value={formData.sell_price || ""} onChange={e => setFormData({ ...formData, sell_price: parseFloat(e.target.value) || 0 })} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Initial Stock</Label>
                                    <Input id="stock" type="number" value={formData.current_stock || ""} onChange={e => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min">Min Stock Alert</Label>
                                    <Input id="min" type="number" value={formData.min_stock || ""} onChange={e => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })} required />
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save Product"}</Button>
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
                        placeholder="Search products by name or SKU..."
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
                            <TableHead>SKU</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Category ID</TableHead>
                            <TableHead className="text-right">Buy Price</TableHead>
                            <TableHead className="text-right">Sell Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.sku}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{categories.find((c: any) => c.id === product.category_id)?.name || product.category_id}</TableCell>
                                    <TableCell className="text-right">${product.buy_price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${product.sell_price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.current_stock <= product.min_stock
                                                ? "bg-red-100 text-red-800"
                                                : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {product.current_stock}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDelete(product)}>
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Product ({selectedProduct?.sku})</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Product Name</Label>
                                <Input id="edit-name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-sku">SKU</Label>
                                <Input id="edit-sku" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select value={formData.category_id?.toString()} onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-buy">Buy Price ($)</Label>
                                <Input id="edit-buy" type="number" step="0.01" value={formData.buy_price} onChange={e => setFormData({ ...formData, buy_price: parseFloat(e.target.value) || 0 })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-sell">Sell Price ($)</Label>
                                <Input id="edit-sell" type="number" step="0.01" value={formData.sell_price} onChange={e => setFormData({ ...formData, sell_price: parseFloat(e.target.value) || 0 })} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-stock">Current Stock</Label>
                                <Input id="edit-stock" type="number" value={formData.current_stock} onChange={e => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-min">Min Stock Alert</Label>
                                <Input id="edit-min" type="number" value={formData.min_stock} onChange={e => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })} required />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Changes"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{selectedProduct?.name}</span>? This action cannot be undone and will affect inventory reports.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
