from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from typing import List, Dict, Any

def get_main_admin_keyboard() -> InlineKeyboardMarkup:
    """Main Admin Dashboard Navigation Keyboard."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="➕ Add Product", callback_data="admin_add_product"),
                InlineKeyboardButton(text="📦 List / Manage Products", callback_data="admin_list_products")
            ],
            [
                InlineKeyboardButton(text="🏷️ Categories", callback_data="admin_categories"),
                InlineKeyboardButton(text="🔧 Engineering Services", callback_data="admin_services")
            ],
            [
                InlineKeyboardButton(text="📊 Analytics & Stats", callback_data="admin_stats"),
                InlineKeyboardButton(text="🌐 Website Direct Link", callback_data="web_link")
            ]
        ]
    )
    return keyboard

def get_category_picker_keyboard(categories: List[Dict[str, Any]]) -> InlineKeyboardMarkup:
    """Category Selector for FSM Product Creation Wizard."""
    buttons = []
    for cat in categories:
        buttons.append([
            InlineKeyboardButton(
                text=f"📁 {cat.get('name')}",
                callback_data=f"select_cat_{cat.get('id')}"
            )
        ])
    buttons.append([InlineKeyboardButton(text="❌ Cancel Operation", callback_data="cancel_fsm")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def get_stock_status_keyboard() -> InlineKeyboardMarkup:
    """Stock Status Selector."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🟢 IN STOCK", callback_data="stock_in_stock"),
                InlineKeyboardButton(text="🟡 LOW STOCK", callback_data="stock_low_stock")
            ],
            [
                InlineKeyboardButton(text="🟣 PRE-ORDER", callback_data="stock_preorder"),
                InlineKeyboardButton(text="🔴 SOLD OUT", callback_data="stock_sold_out")
            ]
        ]
    )

def get_product_action_keyboard(product_id: str, stock_status: str) -> InlineKeyboardMarkup:
    """Actions menu for single product in management list."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🔄 Toggle Stock", callback_data=f"toggle_stock_{product_id}"),
                InlineKeyboardButton(text="🗑️ Delete Item", callback_data=f"delete_prod_{product_id}")
            ],
            [
                InlineKeyboardButton(text="🔙 Back to Products", callback_data="admin_list_products")
            ]
        ]
    )

def get_cancel_keyboard() -> InlineKeyboardMarkup:
    """Cancel FSM Wizard Keyboard."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="❌ Cancel Wizard", callback_data="cancel_fsm")]
        ]
    )
