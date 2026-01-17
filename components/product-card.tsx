import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  id: number
  name: string
  category: string
  price: number
  priceOnRequest?: boolean
  image: string
  description?: string
}

export function ProductCard({ id, name, category, price, priceOnRequest, image, description }: ProductCardProps) {
  return (
    <Link href={`/producto/${id}`}>
      <Card
        className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        <div className="relative overflow-hidden" style={{ backgroundColor: "var(--gros-sand)" }}>
          <img
            src={image || "/placeholder.svg?height=256&width=256&query=product"}
            alt={name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div
            className="absolute top-4 right-0 text-white px-4 py-2 transform rotate-45 origin-right translate-x-12 text-sm font-bold"
            style={{ backgroundColor: "var(--gros-red)" }}
          >
            PERSONALIZADO
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-bold uppercase mb-2" style={{ color: "var(--gros-blue)" }}>
            {category}
          </p>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--gros-black)" }}>
            {name}
          </h3>
          {description && (
            <p className="text-sm mb-4" style={{ color: "#666666" }}>
              {description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold" style={{ color: "var(--gros-red)" }}>
              {priceOnRequest ? "Solicitar cotización" : `$${price}`}
            </span>
            <Button
              size="sm"
              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
              className="hover:opacity-90"
            >
              Ver Detalle
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
