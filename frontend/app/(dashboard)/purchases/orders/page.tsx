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
import { Plus, Search } from "lucide-react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

interface POItem {
    productId: number;
    name: string;
    price: number;
    qty: number;
}

export default function PurchaseOrdersPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const [supplierId, setSupplierId] = useState<string>("");
    const [poItems, setPoItems] = useState<POItem[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [receiveItems, setReceiveItems] = useState<{ productId: number, name: string, orderedQty: number, receivedQty: number }[]>([]);

    // API Queries
    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ["purchase-orders"],
        queryFn: async () => {
            const res = await apiClient.get("/purchases/orders");
            return res.data;
        }
    });

    const { data: suppliers = [] } = useQuery({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const res = await apiClient.get("/purchases/suppliers");
            return res.data;
        }
    });

    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await apiClient.get("/inventory/products");
            return res.data;
        }
    });

    // API Mutations
    const createOrderMutation = useMutation({
        mutationFn: async (newOrder: any) => {
            const res = await apiClient.post("/purchases/orders", newOrder);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            setIsAddOpen(false);
            setSupplierId("");
            setPoItems([]);
        }
    });

    const receiveGoodsMutation = useMutation({
        mutationFn: async ({ poId, payload }: { poId: number, payload: any }) => {
            const res = await apiClient.post(`/purchases/orders/${poId}/receive`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] }); // Stock updated
            setIsReceiveOpen(false);
            setSelectedOrder(null);
            setReceiveItems([]);
        }
    });

    const filteredOrders = orders.filter(
        (order: any) =>
            order.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.po_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add PO Logic
    const poSearchResults = products.filter(
        (p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    const addProductToPO = (product: any) => {
        setPoItems((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { productId: product.id, name: product.name, price: product.buy_price || 0, qty: 1 }];
        });
        setProductSearch("");
    };

    const updatePOQty = (productId: number, qty: number) => {
        if (qty < 1) return;
        setPoItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, qty } : item)));
    };

    const updatePOPrice = (productId: number, price: number) => {
        if (price < 0) return;
        setPoItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, price } : item)));
    };

    const removePOItem = (productId: number) => {
        setPoItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const poTotal = poItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    const handleCreatePO = () => {
        if (!supplierId || poItems.length === 0) return;

        const payload = {
            supplier_id: parseInt(supplierId),
            notes: "PO from Web App",
            items: poItems.map(item => ({
                product_id: item.productId,
                qty: item.qty,
                unit_price: item.price
            }))
        };

        createOrderMutation.mutate(payload);
    };

    // Receive Goods Logic
    const openReceive = (order: any) => {
        setSelectedOrder(order);
        setReceiveItems(order.items.map((item: any) => ({
            productId: item.product_id,
            name: products.find((p: any) => p.id === item.product_id)?.name || "Unknown Product",
            orderedQty: item.qty,
            receivedQty: item.qty // default to receiving all
        })));
        setIsReceiveOpen(true);
    };

    const updateReceivedQty = (productId: number, qty: number) => {
        if (qty < 0) return;
        setReceiveItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, receivedQty: qty } : item)));
    };

    const handleReceiveFull = () => {
        setReceiveItems((prev) => prev.map(item => ({ ...item, receivedQty: item.orderedQty })));
    };

    const handleConfirmReceive = () => {
        if (!selectedOrder) return;

        const payload = {
            notes: "Received from Web App",
            items: receiveItems.filter(item => item.receivedQty > 0).map(item => ({
                product_id: item.productId,
                qty_received: item.receivedQty
            }))
        };

        if (payload.items.length > 0) {
            receiveGoodsMutation.mutate({ poId: selectedOrder.id, payload });
        }
    };

    if (loadingOrders) return <div className="p-8 text-center text-muted-foreground">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
                    <p className="text-muted-foreground">Manage your orders from suppliers.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setSupplierId(""); setPoItems([]); }}>
                            <Plus className="mr-2 h-4 w-4" /> Create PO
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-[800px] lg:max-w-[1000px] max-h-[85vh] overflow-y-auto overflow-x-hidden p-6 md:p-8">
                        <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-2xl">Create Purchase Order</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col md:flex-row gap-8 mt-2">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-4">
                                    <Label htmlFor="supplier">Select Supplier</Label>
                                    <Select value={supplierId} onValueChange={setSupplierId}>
                                        <SelectTrigger id="supplier">
                                            <SelectValue placeholder="Select a supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.length === 0 && <SelectItem value="0" disabled>No suppliers available</SelectItem>}
                                            {suppliers.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="searchProducts">Search Products</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="searchProducts"
                                            placeholder="Search and add products to order..."
                                            className="pl-8"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />

                                        {productSearch && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-2 max-h-60 overflow-auto">
                                                {poSearchResults.length === 0 ? (
                                                    <div className="p-2 text-sm text-muted-foreground">No products found.</div>
                                                ) : (
                                                    poSearchResults.map((p: any) => (
                                                        <div
                                                            key={p.id}
                                                            className="p-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer rounded-sm"
                                                            onClick={() => addProductToPO(p)}
                                                        >
                                                            <div>
                                                                <span className="font-medium text-sm">{p.name}</span>
                                                                <span className="text-xs text-muted-foreground ml-2">({p.sku})</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-sm font-semibold">${(p.buy_price || 0).toFixed(2)}</span>
                                                                <Plus className="h-4 w-4 text-blue-500" />
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-md border overflow-hidden mt-4">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead className="w-24">Unit Cost</TableHead>
                                                    <TableHead className="w-24">Qty</TableHead>
                                                    <TableHead className="w-24 text-right">Subtotal</TableHead>
                                                    <TableHead className="w-12"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {poItems.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                            No products added to this purchase order.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    poItems.map((item) => (
                                                        <TableRow key={item.productId}>
                                                            <TableCell className="font-medium">{item.name}</TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={item.price}
                                                                    min={0}
                                                                    step="0.01"
                                                                    onChange={(e) => updatePOPrice(item.productId, parseFloat(e.target.value) || 0)}
                                                                    className="h-8 w-20"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={item.qty}
                                                                    min={1}
                                                                    onChange={(e) => updatePOQty(item.productId, parseInt(e.target.value) || 1)}
                                                                    className="h-8 w-16"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">${(item.price * item.qty).toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <Button variant="ghost" size="icon" onClick={() => removePOItem(item.productId)} className="h-8 w-8 text-destructive">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-80 shrink-0">
                                <Card className="sticky top-0 shadow-sm border-slate-200 overflow-hidden py-0 gap-0">
                                    <CardHeader className="bg-slate-900 text-white p-6">
                                        <CardTitle className="text-white">Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 px-6 pt-6 pb-4">
                                        <div className="border-t pt-4 flex justify-between font-bold text-xl">
                                            <span>Total Amount</span>
                                            <span>${poTotal.toFixed(2)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-6 pb-6 pt-2 flex flex-col gap-2">
                                        <Button
                                            className="w-full h-12 text-lg font-semibold"
                                            size="lg"
                                            onClick={handleCreatePO}
                                            disabled={!supplierId || poItems.length === 0 || createOrderMutation.isPending}
                                        >
                                            {createOrderMutation.isPending ? "Creating..." : "Create PO"}
                                        </Button>
                                        <Button className="w-full" variant="outline" onClick={() => setIsAddOpen(false)}>
                                            Cancel
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search POs..."
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
                            <TableHead>PO Number</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.po_number}</TableCell>
                                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{order.supplier?.name}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === "received"
                                                ? "bg-green-100 text-green-800"
                                                : order.status === "ordered"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        {order.status === "ordered" && (
                                            <Button variant="outline" size="sm" className="ml-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-white" onClick={() => openReceive(order)}>
                                                Receive
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Receive Dialog */}
            <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
                <DialogContent className="w-[95vw] sm:max-w-[800px] lg:max-w-[900px]">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>Receive Goods for {selectedOrder?.po_number}</DialogTitle>
                        <Button variant="secondary" size="sm" onClick={handleReceiveFull} className="mr-8">
                            Receive All Full
                        </Button>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="w-32 text-center">Ordered Qty</TableHead>
                                        <TableHead className="w-40 text-center">Received Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receiveItems.map((item) => (
                                        <TableRow key={item.productId} className={item.receivedQty === item.orderedQty ? "bg-green-50/50" : ""}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center font-semibold text-slate-600">{item.orderedQty}</TableCell>
                                            <TableCell align="center">
                                                <Input
                                                    type="number"
                                                    value={item.receivedQty}
                                                    min={0}
                                                    max={item.orderedQty}
                                                    onChange={(e) => updateReceivedQty(item.productId, parseInt(e.target.value) || 0)}
                                                    className={`w-24 text-center ${item.receivedQty === item.orderedQty ? "border-green-500 bg-white right" : ""}`}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsReceiveOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={handleConfirmReceive} disabled={receiveGoodsMutation.isPending}>{receiveGoodsMutation.isPending ? "Receiving..." : "Confirm Receipt"}</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
