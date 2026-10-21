import httpx
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from config import settings

class SupabaseDB:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.client: Optional[Client] = None
        if self.url and self.key and "example" not in self.url:
            try:
                self.client = create_client(self.url, self.key)
            except Exception as e:
                print(f"[SupabaseDB] Initialization warning: {e}")

    async def get_stats(self) -> Dict[str, Any]:
        """Fetch dashboard analytics summary."""
        if not self.client:
            print("[SupabaseDB] Supabase is not configured. Reporting zeroed stats.")
            return {"total_products": 0, "low_stock": 0, "categories": 0, "services": 0}

        try:
            products_res = self.client.table("products").select("id, stock_status", count="exact").execute()
            categories_res = self.client.table("categories").select("id", count="exact").execute()
            services_res = self.client.table("services").select("id", count="exact").execute()
            
            total_prods = products_res.count or len(products_res.data)
            low_stock = sum(1 for p in products_res.data if p.get("stock_status") == "low_stock")
            total_cats = categories_res.count or len(categories_res.data)
            total_srvs = services_res.count or len(services_res.data)
            
            return {
                "total_products": total_prods,
                "low_stock": low_stock,
                "categories": total_cats,
                "services": total_srvs,
            }
        except Exception as e:
            print(f"[SupabaseDB] Error fetching stats: {e}")
            return {"total_products": 0, "low_stock": 0, "categories": 0, "services": 0}

    async def get_categories(self) -> List[Dict[str, Any]]:
        """Fetch all category records."""
        if not self.client:
            print("[SupabaseDB] Supabase is not configured. Returning no categories.")
            return []

        try:
            res = self.client.table("categories").select("*").order("display_order").execute()
            return res.data
        except Exception as e:
            print(f"[SupabaseDB] Error fetching categories: {e}")
            return []

    async def get_products(self, query: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch products with optional search query."""
        if not self.client:
            print("[SupabaseDB] Supabase is not configured. Returning no products.")
            return []

        try:
            q = self.client.table("products").select("*, category:categories(name)").order("created_at", desc=True).limit(limit)
            if query:
                q = q.ilike("name", f"%{query}%")
            res = q.execute()
            return res.data
        except Exception as e:
            print(f"[SupabaseDB] Error fetching products: {e}")
            return []

    async def create_product(self, product_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert new product into database."""
        if not self.client:
            product_data["id"] = "mock-new-id"
            return product_data
        
        try:
            res = self.client.table("products").insert(product_data).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            print(f"[SupabaseDB] Error creating product: {e}")
            return None

    async def add_product_image(self, product_id: str, image_url: str, is_primary: bool = True) -> bool:
        """Insert product image link."""
        if not self.client:
            return True
        try:
            self.client.table("product_images").insert({
                "product_id": product_id,
                "url": image_url,
                "is_primary": is_primary
            }).execute()
            return True
        except Exception as e:
            print(f"[SupabaseDB] Error adding image record: {e}")
            return False

    async def upload_photo_file(self, file_bytes: bytes, filename: str) -> Optional[str]:
        """Upload raw image bytes directly to Supabase Storage bucket 'product-media'."""
        if not self.client:
            # Fallback image link used only when Supabase Storage is unreachable.
            return "https://images.unsplash.com/photo-1509391366360-2e959784a276"
        
        try:
            bucket_name = "product-media"
            res = self.client.storage.from_(bucket_name).upload(
                file=file_bytes,
                path=filename,
                file_options={"content-type": "image/jpeg", "x-upsert": "true"}
            )
            # Retrieve public URL
            public_url = self.client.storage.from_(bucket_name).get_public_url(filename)
            return public_url
        except Exception as e:
            print(f"[SupabaseDB] Storage upload error: {e}")
            # Fallback to demo unsplash URL if bucket unconfigured
            return "https://images.unsplash.com/photo-1544441893-675973e31985"

    async def update_product_stock(self, product_id: str, stock_status: str) -> bool:
        """Update product stock status."""
        if not self.client:
            return True
        try:
            self.client.table("products").update({"stock_status": stock_status}).eq("id", product_id).execute()
            return True
        except Exception as e:
            print(f"[SupabaseDB] Stock update error: {e}")
            return False

    async def delete_product(self, product_id: str) -> bool:
        """Delete product by ID."""
        if not self.client:
            return True
        try:
            self.client.table("products").delete().eq("id", product_id).execute()
            return True
        except Exception as e:
            print(f"[SupabaseDB] Delete product error: {e}")
            return False

db = SupabaseDB()
