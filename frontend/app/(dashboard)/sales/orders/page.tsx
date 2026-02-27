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

interface LineItem {
    productId: number;
    name: string;
    price: number;
    qty: number;
}

export default function SalesOrdersPage() {
    const queryClient = useQueryClient();

    // Main List State
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Add POS State
    const [customerId, setCustomerId] = useState<string>("");
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [productSearch, setProductSearch] = useState("");

    // Data Fetching
    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ["sales-orders"],
        queryFn: async () => {
            const res = await apiClient.get("/sales/orders");
            return res.data;
        }
    });

    const { data: customers = [] } = useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            const res = await apiClient.get("/sales/customers");
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

    const createOrderMutation = useMutation({
        mutationFn: async (newOrder: any) => {
            const res = await apiClient.post("/sales/orders", newOrder);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresh stock
            queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
            setIsAddOpen(false);
            setCustomerId("");
            setLineItems([]);
        }
    });

    const filteredOrders = orders.filter(
        (order: any) =>
            order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // POS Logic
    const posSearchResults = products.filter(
        (p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    const addProductToCart = (product: any) => {
        setLineItems((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { productId: product.id, name: product.name, price: product.sell_price, qty: 1 }];
        });
        setProductSearch("");
    };

    const updateCartQty = (productId: number, qty: number) => {
        if (qty < 1) return;
        setLineItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, qty } : item)));
    };

    const removeCartItem = (productId: number) => {
        setLineItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const cartSubtotal = lineItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    // Let's assume backend takes care of total, but we show here for UI purposes
    const cartTotal = cartSubtotal; // Simplified without tax for now

    const handleCreateOrder = () => {
        if (!customerId || lineItems.length === 0) return;

        const payload = {
            customer_id: parseInt(customerId),
            notes: "POS Sale",
            discount: 0,
            items: lineItems.map(item => ({
                product_id: item.productId,
                qty: item.qty,
                unit_price: item.price,
                discount: 0
            }))
        };

        createOrderMutation.mutate(payload);
    };

    if (loadingOrders) return <div className="p-8 text-center text-muted-foreground">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
                    <p className="text-muted-foreground">Manage your customer orders and invoices.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setCustomerId(""); setLineItems([]); }}>
                            <Plus className="mr-2 h-4 w-4" /> New Sale (POS)
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-[800px] lg:max-w-[1000px] max-h-[85vh] overflow-y-auto overflow-x-hidden p-6 md:p-8">
                        <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-2xl">Point of Sale / New Invoice</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col md:flex-row gap-8 mt-2">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-4">
                                    <Label htmlFor="customer">Select Customer</Label>
                                    <Select value={customerId} onValueChange={setCustomerId}>
                                        <SelectTrigger id="customer">
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.length === 0 && <SelectItem value="0" disabled>No customers available</SelectItem>}
                                            {customers.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name}
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
                                            placeholder="Search and add products..."
                                            className="pl-8"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />

                                        {productSearch && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-2 max-h-60 overflow-auto">
                                                {posSearchResults.length === 0 ? (
                                                    <div className="p-2 text-sm text-muted-foreground">No products found.</div>
                                                ) : (
                                                    posSearchResults.map((p: any) => (
                                                        <div
                                                            key={p.id}
                                                            className="p-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer rounded-sm"
                                                            onClick={() => addProductToCart(p)}
                                                        >
                                                            <div>
                                                                <span className="font-medium text-sm">{p.name}</span>
                                                                <span className="text-xs text-muted-foreground ml-2">({p.sku})</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-sm font-semibold">${p.sell_price.toFixed(2)}</span>
                                                                <span className="text-xs text-muted-foreground">Stock: {p.current_stock}</span>
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
                                                    <TableHead className="w-24">Price</TableHead>
                                                    <TableHead className="w-24">Qty</TableHead>
                                                    <TableHead className="w-24 text-right">Subtotal</TableHead>
                                                    <TableHead className="w-12"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {lineItems.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                            No products added to this sale.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    lineItems.map((item) => (
                                                        <TableRow key={item.productId}>
                                                            <TableCell className="font-medium">{item.name}</TableCell>
                                                            <TableCell>${item.price.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={item.qty}
                                                                    min={1}
                                                                    onChange={(e) => updateCartQty(item.productId, parseInt(e.target.value) || 1)}
                                                                    className="h-8 w-16"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">${(item.price * item.qty).toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <Button variant="ghost" size="icon" onClick={() => removeCartItem(item.productId)} className="h-8 w-8 text-destructive">
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

                            {/* Order Summary */}
                            <div className="w-full md:w-80 shrink-0">
                                <Card className="sticky top-0 shadow-sm border-slate-200 overflow-hidden py-0 gap-0">
                                    <CardHeader className="bg-slate-900 text-white p-6">
                                        <CardTitle className="text-white">Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 px-6 pt-6 pb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">${cartSubtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-4 flex justify-between font-bold text-xl">
                                            <span>Total</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-6 pb-6 pt-2 flex flex-col gap-2">
                                        <Button
                                            className="w-full h-12 text-lg font-semibold"
                                            size="lg"
                                            onClick={handleCreateOrder}
                                            disabled={!customerId || lineItems.length === 0 || createOrderMutation.isPending}
                                        >
                                            {createOrderMutation.isPending ? "Processing..." : "Create Invoice"}
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
                        placeholder="Search orders..."
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
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.order_number}</TableCell>
                                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{order.customer?.name}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === "paid"
                                                ? "bg-green-100 text-green-800"
                                                : order.status === "unpaid"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
