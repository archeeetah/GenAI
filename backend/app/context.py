import contextvars

# Context Variables to hold request-specific data
user_id_ctx = contextvars.ContextVar("user_id_ctx", default=None)
session_id_ctx = contextvars.ContextVar("session_id_ctx", default=None)

def set_chat_context(user_id: str, session_id: str):
    token_user = user_id_ctx.set(user_id)
    token_session = session_id_ctx.set(session_id)
    return token_user, token_session

def get_chat_context():
    return user_id_ctx.get(), session_id_ctx.get()
