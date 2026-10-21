from typing import Callable, Dict, Any, Awaitable
import logging
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from config import settings

logger = logging.getLogger("sara-power-backend")

class AdminAuthMiddleware(BaseMiddleware):
    """Middleware checking if user Telegram ID is authorized to access admin features."""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        user = event.from_user
        if not user:
            return

        allowed_ids = settings.admin_id_list

        # Fail closed: an empty allowlist denies every admin action.
        if not allowed_ids:
            logger.error(
                "ALLOWED_ADMIN_IDS is empty. Denying Telegram admin access for user %s.",
                user.id,
            )
            allowed_ids = []

        if user.id not in allowed_ids:
            msg_text = f"⛔ ACCESS DENIED: Telegram ID {user.id} is not authorized for the Sara Power admin desk."
            if isinstance(event, Message):
                await event.answer(msg_text)
            elif isinstance(event, CallbackQuery):
                await event.answer(msg_text, show_alert=True)
            return

        return await handler(event, data)
