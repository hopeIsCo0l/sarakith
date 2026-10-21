from aiogram import Router, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from db.supabase_client import db
from bot.keyboards import get_main_admin_keyboard
from config import settings

router = Router()

@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    """Handle /start command with welcome dashboard."""
    await state.clear()
    args = message.text.split(maxsplit=1)
    
    # Handle deep-linking from website inquiries (e.g. /start inquire_must-5-5kw-inverter)
    if len(args) > 1:
        param = args[1]
        if param.startswith("inquire_"):
            slug = param.replace("inquire_", "")
            await message.answer(
                f"📩 **NEW INQUIRY RECEIVED FOR ITEM:** `{slug}`\n\n"
                f"User `{message.from_user.full_name}` (@{message.from_user.username or 'N/A'}) requested catalog information.\n"
                f"Our admin team will reach out directly with availability and sizing recommendations.",
                parse_mode="Markdown"
            )
            return
        elif param.startswith("service_"):
            slug = param.replace("service_", "")
            await message.answer(
                f"🔧 **NEW SERVICE INQUIRY:** `{slug}`\n\n"
                f"User `{message.from_user.full_name}` (@{message.from_user.username or 'N/A'}) submitted a project request.",
                parse_mode="Markdown"
            )
            return

    # Regular Admin Welcome Screen
    text = (
      "⚡ **Sara Power Solution plc — TELEGRAM BOT ADMIN DESK**\n"
      "======================================\n"
      "Welcome to the Sara Power Solution plc Solar Equipment management panel.\n"
      "Use the controls below to manage solar panels, inverters, stock levels, or view catalog analytics."
    )
    await message.answer(text, reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")

@router.message(Command("menu"))
async def cmd_menu(message: Message, state: FSMContext):
    await state.clear()
    await message.answer("🎛️ **Sara Power Solution Admin Control Panel:**", reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data == "admin_menu")
async def cb_admin_menu(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.message.edit_text("🎛️ **Sara Power Admin Control Panel:**", reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data == "admin_stats")
async def cb_admin_stats(callback: CallbackQuery):
    stats = await db.get_stats()
    text = (
        "📊 **CATALOG ANALYTICS DASHBOARD**\n"
        "------------------------------------\n"
        f"📦 Total Active Products: `{stats['total_products']}`\n"
        f"⚠️ Low Stock Products: `{stats['low_stock']}`\n"
        f"📁 Active Categories: `{stats['categories']}`\n"
        f"🔧 Active Services: `{stats['services']}`\n"
        "------------------------------------\n"
        "🟢 Database Connection: Supabase PostgreSQL Active"
    )
    await callback.message.edit_text(text, reply_markup=get_main_admin_keyboard(), parse_mode="Markdown")

@router.callback_query(F.data == "web_link")
async def cb_web_link(callback: CallbackQuery):
    await callback.answer(f"🌐 Sara Power Web App: {settings.FRONTEND_URL}", show_alert=True)

@router.callback_query(F.data == "cancel_fsm")
async def cb_cancel_fsm(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.message.edit_text("❌ Operation cancelled. Returned to main dashboard.", reply_markup=get_main_admin_keyboard())
