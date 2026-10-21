import io
from aiogram import Router, F, Bot
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from db.supabase_client import db
from bot.states import ProductForm
from bot.keyboards import (
    get_category_picker_keyboard,
    get_stock_status_keyboard,
    get_product_action_keyboard,
    get_cancel_keyboard,
    get_main_admin_keyboard,
)

router = Router()

# ---------------------------------------------------------------------
# 1. ADD PRODUCT FSM WIZARD
# ---------------------------------------------------------------------

@router.callback_query(F.data == "admin_add_product")
async def start_add_product_wizard(callback: CallbackQuery, state: FSMContext):
    """Step 1: Ask for Product Name."""
    await state.set_state(ProductForm.waiting_for_name)
    await callback.message.edit_text(
        "➕ **ADD NEW PRODUCT (STEP 1/7)**\n\n"
        "Please send the **Product Name** (e.g. `Must 5.5kW Hybrid Solar Inverter`):",
        reply_markup=get_cancel_keyboard(),
        parse_mode="Markdown"
    )

@router.message(ProductForm.waiting_for_name)
async def process_product_name(message: Message, state: FSMContext):
    name = message.text.strip()
    await state.update_data(name=name)
    
    # Step 2: Pick Category
    categories = await db.get_categories()
    await state.set_state(ProductForm.waiting_for_category)
    await message.answer(
        f"✅ Name set to: `{name}`\n\n"
        "**STEP 2/7: Select Category** for this product:",
        reply_markup=get_category_picker_keyboard(categories),
        parse_mode="Markdown"
    )

@router.callback_query(ProductForm.waiting_for_category, F.data.startswith("select_cat_"))
async def process_product_category(callback: CallbackQuery, state: FSMContext):
    cat_id = callback.data.replace("select_cat_", "")
    await state.update_data(category_id=cat_id)
    
    # Step 3: Ask for Price
    await state.set_state(ProductForm.waiting_for_price)
    await callback.message.edit_text(
        "✅ Category selected.\n\n"
        "**STEP 3/7: Enter Price in USD** (numeric only, e.g. `450` or `895.00`):",
        reply_markup=get_cancel_keyboard(),
        parse_mode="Markdown"
    )

@router.message(ProductForm.waiting_for_price)
async def process_product_price(message: Message, state: FSMContext):
    try:
        price = float(message.text.strip().replace("$", ""))
        await state.update_data(price=price)
    except ValueError:
        await message.answer("⚠️ Invalid numeric price. Please enter a valid number (e.g. `245.00`):")
        return

    # Step 4: Ask for SKU
    await state.set_state(ProductForm.waiting_for_sku)
    await message.answer(
        f"✅ Price set to: `${price:.2f}`\n\n"
        "**STEP 4/7: Enter SKU Code** (e.g. `KTH-OUT-009` or type `skip`):",
        reply_markup=get_cancel_keyboard(),
        parse_mode="Markdown"
    )

@router.message(ProductForm.waiting_for_sku)
async def process_product_sku(message: Message, state: FSMContext):
    sku = message.text.strip()
    if sku.lower() != "skip":
        await state.update_data(sku=sku.upper())
    
    # Step 5: Description
    await state.set_state(ProductForm.waiting_for_description)
    await message.answer(
        "**STEP 5/7: Enter Product Description** (editorial specs & fit overview):",
        reply_markup=get_cancel_keyboard(),
        parse_mode="Markdown"
    )

@router.message(ProductForm.waiting_for_description)
async def process_product_description(message: Message, state: FSMContext):
    desc = message.text.strip()
    await state.update_data(description=desc)
    
    # Step 6: Material Spec
    await state.set_state(ProductForm.waiting_for_material)
    await message.answer(
        "**STEP 6/7: Enter Primary Material / Fabric Spec** (e.g. `100% Organic French Terry Cotton`):",
        reply_markup=get_cancel_keyboard(),
        parse_mode="Markdown"
    )

@router.message(ProductForm.waiting_for_material)
async def process_product_material(message: Message, state: FSMContext):
    material = message.text.strip()
    await state.update_data(material=material)
    
    # Step 7: Send Photo
    await state.set_state(ProductForm.waiting_for_photo)
    await message.answer(
        "📸 **STEP 7/7: Upload High-Res Product Image**\n\n"
        "Send an image photo attachment directly in this chat. It will be streamed directly to your Supabase Storage bucket (`product-media`).",
        reply_markup=get_cancel_keyboard(),
        parse_mode="Markdown"
    )

@router.message(ProductForm.waiting_for_photo, F.photo)
async def process_product_photo(message: Message, state: FSMContext, bot: Bot):
    photo = message.photo[-1] # Get highest resolution photo
    file_info = await bot.get_file(photo.file_id)
    photo_bytes_io = await bot.download_file(file_info.file_path)
    photo_bytes = photo_bytes_io.read()

    filename = f"prod_{message.date.timestamp()}_{photo.file_id[:8]}.jpg"
    await message.answer("⏳ Streaming image to Supabase Storage bucket (`product-media`)...")

    # Upload to Supabase Storage
    public_url = await db.upload_photo_file(photo_bytes, filename)
    await state.update_data(image_url=public_url)

    # Step 8: Select Stock Status
    await state.set_state(ProductForm.waiting_for_stock)
    await message.answer(
        "✅ Image uploaded successfully!\n\n"
        "**FINAL STEP: Select Initial Stock Status**:",
        reply_markup=get_stock_status_keyboard(),
        parse_mode="Markdown"
    )

@router.callback_query(ProductForm.waiting_for_stock, F.data.startswith("stock_"))
async def process_product_stock_and_save(callback: CallbackQuery, state: FSMContext):
    stock_status = callback.data.replace("stock_", "")
    data = await state.get_data()

    slug = data["name"].lower().replace(" ", "-").replace("/", "-")
    
    product_payload = {
        "name": data["name"],
        "slug": slug,
        "sku": data.get("sku"),
        "price": data["price"],
        "currency": "USD",
        "description": data["description"],
        "details": {"material": data.get("material", "Heavyweight Organic Blend")},
        "category_id": data.get("category_id"),
        "stock_status": stock_status,
        "is_visible": True,
        "is_featured": True,
    }

    # Insert Product
    created_prod = await db.create_product(product_payload)
    if created_prod:
        prod_id = created_prod.get("id", "new-id")
        if data.get("image_url"):
            await db.add_product_image(prod_id, data["image_url"], is_primary=True)

        await state.clear()
        summary_text = (
            "🎉 **PRODUCT SUCCESSFULLY CREATED & PUBLISHED!**\n"
            "------------------------------------\n"
            f"📦 **Name:** `{data['name']}`\n"
            f"💰 **Price:** `${data['price']:.2f}`\n"
            f"🏷️ **SKU:** `{data.get('sku', 'N/A')}`\n"
            f"🟢 **Stock:** `{stock_status}`\n"
            f"🖼️ **Image:** [Supabase CDN Link]({data.get('image_url')})\n\n"
            "Item is now live on your Next.js catalog website."
        )
        await callback.message.edit_text(summary_text, reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")
    else:
        await callback.message.edit_text("❌ Database insert error. Returned to menu.", reply_markup=get_main_admin_keyboard())

# ---------------------------------------------------------------------
# 2. LIST / MANAGE PRODUCTS
# ---------------------------------------------------------------------

@router.callback_query(F.data == "admin_list_products")
async def cb_list_products(callback: CallbackQuery):
    products = await db.get_products(limit=10)
    if not products:
        await callback.message.edit_text("📦 No products found in catalog.", reply_markup=get_main_admin_keyboard())
        return

    text = "📦 **PRODUCT LIST (Top 10)**\nSelect a product to edit or toggle stock status:\n\n"
    for p in products:
        stock_emoji = "🟢" if p.get("stock_status") == "in_stock" else "🔴"
        text += f"{stock_emoji} **{p.get('name')}** — `${p.get('price')}` (SKU: `{p.get('sku', 'N/A')}`)\n"

    await callback.message.edit_text(text, reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data.startswith("toggle_stock_"))
async def cb_toggle_stock(callback: CallbackQuery):
    product_id = callback.data.replace("toggle_stock_", "")
    await db.update_product_stock(product_id, "low_stock")
    await callback.answer("✅ Product stock status updated to LOW STOCK", show_alert=True)

@router.callback_query(F.data.startswith("delete_prod_"))
async def cb_delete_product(callback: CallbackQuery):
    product_id = callback.data.replace("delete_prod_", "")
    await db.delete_product(product_id)
    await callback.answer("🗑️ Product deleted from Supabase", show_alert=True)
    await cb_list_products(callback)
