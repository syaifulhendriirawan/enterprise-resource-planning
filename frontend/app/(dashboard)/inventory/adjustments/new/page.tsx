"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function StockAdjustmentForm() {
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
        <div className="mx-auto max-w-2xl space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/inventory/products">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Stock Adjustment</h2>
                    <p className="text-muted-foreground">Manually adjust inventory levels for a product.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Adjustment Detail</CardTitle>
                        <CardDescription>Use this form to account for damage, loss, or auditing counts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product">Select Product</Label>
                            <Select>
                                <SelectTrigger id="product">
                                    <SelectValue placeholder="Search / Select product..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRD-001">Wireless Mouse (Current: 45 pcs)</SelectItem>
                                    <SelectItem value="PRD-002">Mechanical Keyboard (Current: 12 pcs)</SelectItem>
                                    <SelectItem value="PRD-003">Monitor Arm (Current: 8 pcs)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Adjustment Type</Label>
                                <Select defaultValue="subtract">
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="add">Add Stock (+)</SelectItem>
                                        <SelectItem value="subtract">Deduct Stock (-)</SelectItem>
                                        <SelectItem value="set">Set Exact Quantity (=)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qty">Quantity</Label>
                                <Input id="qty" type="number" min="1" placeholder="0" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Adjustment</Label>
                            <Select defaultValue="damage">
                                <SelectTrigger id="reason">
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="damage">Damaged Goods</SelectItem>
                                    <SelectItem value="loss">Loss / Theft</SelectItem>
                                    <SelectItem value="audit">Inventory Audit Check</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea id="notes" placeholder="Explain further context..." rows={3} />
                        </div>

                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t">
                            <Link href="/inventory/products">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`} />
                                {isSubmitting ? "Adjusting..." : "Confirm Adjustment"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
