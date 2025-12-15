# streamlit_app.py
import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="FinBot (Saved Chat)", layout="wide")

# Sidebar for User Login
with st.sidebar:
    st.header("👤 User Session")
    user_id = st.text_input("Enter User ID", value="user_123")
    
    if st.button("Load Chat History"):
        try:
            res = requests.get(f"{API_URL}/history/{user_id}")
            if res.status_code == 200:
                history_data = res.json().get("history", [])
                st.session_state.messages = history_data
                st.success("History Loaded!")
            else:
                st.error("Could not load history.")
        except Exception as e:
            st.error(f"Connection Error: {e}")

    if st.button("Clear / New Chat"):
        st.session_state.messages = []
        st.rerun()

# Initialize State
if "messages" not in st.session_state:
    st.session_state.messages = []

st.title("🏦 FinBot with Memory")

# Display Messages
for msg in st.session_state.messages:
    # Map 'model' to 'assistant' for Streamlit UI
    role = "assistant" if msg["role"] == "model" else msg["role"]
    with st.chat_message(role):
        st.markdown(msg["content"])

# Chat Input
if prompt := st.chat_input("Continue conversation..."):
    # 1. Display immediately
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 2. Send to API (API handles saving)
    payload = {
        "user_id": user_id,
        "message": prompt,
        "history": [] # API now handles history loading, we just send ID
    }
    
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            res = requests.post(f"{API_URL}/chat", json=payload)
            if res.status_code == 200:
                reply = res.json()["response"]
                st.markdown(reply)
                # Append to local state so we don't need to refresh
                st.session_state.messages.append({"role": "model", "content": reply})
            else:
                st.error("Error connecting to bot")