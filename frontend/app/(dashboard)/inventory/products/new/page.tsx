"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ProductFormPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API save
        setTimeout(() => {
            setIsSubmitting(false);
            router.push("/inventory/products");
        }, 1000);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/inventory/products">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
                    <p className="text-muted-foreground">Create a new product in the inventory.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input id="name" placeholder="E.g. Wireless Mouse" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <Input id="sku" placeholder="E.g. SKU-12345" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="electronics">Electronics</SelectItem>
                                        <SelectItem value="furniture">Furniture</SelectItem>
                                        <SelectItem value="accessories">Accessories</SelectItem>
                                        <SelectItem value="stationery">Stationery</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit Measure</Label>
                                <Select defaultValue="pcs">
                                    <SelectTrigger id="unit">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pcs">Pcs</SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="kg">Kg</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Optional product description..." rows={3} />
                        </div>

                        <h3 className="text-lg font-medium pt-4 border-t">Pricing & Stock</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="buy_price">Buy Price ($) *</Label>
                                <Input id="buy_price" type="number" step="0.01" min="0" placeholder="0.00" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sell_price">Sell Price ($) *</Label>
                                <Input id="sell_price" type="number" step="0.01" min="0" placeholder="0.00" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_stock">Initial Stock</Label>
                                <Input id="current_stock" type="number" min="0" defaultValue="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min_stock">Minimum Stock Alert</Label>
                                <Input id="min_stock" type="number" min="0" defaultValue="5" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6">
                            <Link href="/inventory/products">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Saving..." : "Save Product"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
