import streamlit as st
import requests
import json

# --- CONFIGURATION ---
API_URL = "http://127.0.0.1:8000"
st.set_page_config(page_title="FinBot Backend Tester", page_icon="🏦", layout="wide")

# --- SESSION STATE ---
if "messages" not in st.session_state:
    st.session_state.messages = []
if "session_id" not in st.session_state:
    st.session_state.session_id = "test_user_streamlit"
if "current_doc_id" not in st.session_state:
    st.session_state.current_doc_id = None

# --- SIDEBAR ---
with st.sidebar:
    st.header("⚙️ Mode Selection")
    mode = st.radio(
        "Choose Functionality:",
        ["Standard Banking Chat", "Legal Risk Audit", "Chat with Document"]
    )
    
    st.divider()
    
    # Context Management for "Chat with Doc"
    if mode == "Chat with Document":
        st.info("Upload a document to enable context-aware chat.")
        uploaded_file = st.file_uploader("Upload PDF/Image for Chat", type=["pdf", "jpg", "png", "jpeg"])
        
        if uploaded_file and st.button("Process for Chat"):
            with st.spinner("Reading document..."):
                files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
                try:
                    res = requests.post(f"{API_URL}/upload-doc", files=files)
                    if res.status_code == 200:
                        data = res.json()
                        st.session_state.current_doc_id = data["doc_id"]
                        st.success("Document Memory Created!")
                        st.caption(f"Doc ID: {data['doc_id']}")
                    else:
                        st.error(f"Error: {res.text}")
                except Exception as e:
                    st.error(f"Connection Failed: {e}")

    # Reset Button
    if st.button("Clear Chat History"):
        st.session_state.messages = []
        st.rerun()

# --- MAIN INTERFACE ---
st.title("🏦 FinBot Backend Tester")

# === MODE 1 & 3: CHAT INTERFACE ===
if mode in ["Standard Banking Chat", "Chat with Document"]:
    
    # Display Banner for Context Mode
    if mode == "Chat with Document":
        if st.session_state.current_doc_id:
            st.success(f"🟢 Chatting with Context (Doc ID: {st.session_state.current_doc_id})")
        else:
            st.warning("🔴 No document active. Please upload one in the sidebar.")

    # Display Chat History
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Chat Input
    if prompt := st.chat_input("Ask about loans, investments, or your document..."):
        # 1. User Message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # 2. Prepare Payload
        payload = {
            "user_id": st.session_state.session_id,
            "message": prompt,
            "history": [] # In a real app, you might send summary history
        }
        
        # Inject Doc ID if in that mode
        if mode == "Chat with Document" and st.session_state.current_doc_id:
            payload["doc_id"] = st.session_state.current_doc_id

        # 3. Get Bot Response
        with st.chat_message("assistant"):
            with st.spinner("FinBot is thinking..."):
                try:
                    response = requests.post(f"{API_URL}/chat", json=payload)
                    if response.status_code == 200:
                        bot_reply = response.json().get("response", "No response text found.")
                        st.markdown(bot_reply)
                        st.session_state.messages.append({"role": "assistant", "content": bot_reply})
                    else:
                        st.error(f"API Error {response.status_code}: {response.text}")
                except Exception as e:
                    st.error(f"Connection Error: Is FastAPI running? \n\n{e}")

# === MODE 2: LEGAL RISK AUDIT (One-off Analysis) ===
elif mode == "Legal Risk Audit":
    st.subheader("⚖️ Legal Document Analyzer")
    st.write("Upload a loan agreement or contract to identify hidden risks.")
    
    audit_file = st.file_uploader("Upload Document for Audit", type=["pdf", "jpg", "png"])
    
    if audit_file and st.button("Analyze Risks"):
        with st.spinner("Auditing Document (This may take 10-20 seconds)..."):
            files = {"file": (audit_file.name, audit_file, audit_file.type)}
            try:
                res = requests.post(f"{API_URL}/analyze-doc", files=files)
                
                if res.status_code == 200:
                    data = res.json()
                    analysis_text = data.get("analysis", "No analysis returned.")
                    
                    # Display Results
                    st.success("Audit Complete")
                    with st.expander("View Raw JSON Response"):
                        st.json(data)
                    
                    st.markdown("### 📋 Analysis Report")
                    st.markdown(analysis_text)
                else:
                    st.error(f"Analysis Failed: {res.text}")
            except Exception as e:
                st.error(f"Connection Error: {e}")