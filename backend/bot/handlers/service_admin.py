from aiogram import Router, F
from aiogram.types import CallbackQuery
from db.supabase_client import db
from bot.keyboards import get_main_admin_keyboard

router = Router()

@router.callback_query(F.data == "admin_categories")
async def cb_admin_categories(callback: CallbackQuery):
    categories = await db.get_categories()
    text = "📁 **ACTIVE CATALOG CATEGORIES**\n\n"
    for cat in categories:
        text += f"• **{cat.get('name')}** (Slug: `{cat.get('slug')}`)\n"
    text += "\nAll categories are synchronized with Supabase."
    await callback.message.edit_text(text, reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data == "admin_services")
async def cb_admin_services(callback: CallbackQuery):
    stats = await db.get_stats()
    text = (
        "🔧 **ENGINEERING SERVICES DESK**\n\n"
        f"Active Showcase Services: `{stats['services']}`\n\n"
        "• Residential & Commercial Solar System Installation (Custom Quote)\n"
        "• Off-Grid Micro-Grid & Hybrid Design (Custom Quote)\n"
        "• LiFePO4 Battery Bank Upgrade & Commissioning (Custom Quote)\n\n"
        "Clients can submit project briefs directly through the website to this Telegram Bot."
    )
    await callback.message.edit_text(text, reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")
