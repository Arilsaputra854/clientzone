import { ProductForm } from "@/components/forms/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Produk Baru</h1>
        <p className="text-muted-foreground">Isi detail produk untuk ditambahkan ke katalog.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
