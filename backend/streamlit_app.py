# streamlit_app.py
import streamlit as st
import requests
import json

# --- CONFIGURATION ---
API_URL = "http://127.0.0.1:8000"
st.set_page_config(page_title="FinBot Banking Assistant", page_icon="🏦", layout="wide")

# --- SESSION STATE INITIALIZATION ---
if "messages" not in st.session_state:
    st.session_state.messages = []
if "session_id" not in st.session_state:
    st.session_state.session_id = "session_01"  # Default Session
if "user_id" not in st.session_state:
    st.session_state.user_id = "user_123"       # Default User
if "current_doc_id" not in st.session_state:
    st.session_state.current_doc_id = None

# --- SIDEBAR: SETTINGS & TOOLS ---
with st.sidebar:
    st.header("⚙️ Control Panel")
    
    # 1. User & Session Management
    st.subheader("👤 Identity")
    user_input = st.text_input("User ID", value=st.session_state.user_id)
    session_input = st.text_input("Session ID", value=st.session_state.session_id)
    
    # Update State if changed
    if user_input: st.session_state.user_id = user_input
    if session_input: st.session_state.session_id = session_input

    col1, col2 = st.columns(2)
    with col1:
        if st.button("Load History"):
            # Fetch history for specific User + Session
            try:
                params = {"session_id": st.session_state.session_id}
                res = requests.get(f"{API_URL}/history/{st.session_state.user_id}", params=params)
                if res.status_code == 200:
                    history_data = res.json().get("history", [])
                    st.session_state.messages = history_data
                    st.success("Loaded!")
                else:
                    st.error("Failed.")
            except Exception as e:
                st.error(f"Error: {e}")
    with col2:
        if st.button("Clear Chat"):
            st.session_state.messages = []
            st.rerun()

    st.divider()

    # 2. Mode Selection
    mode = st.radio(
        "Select Mode:",
        ["Standard Banking Chat", "Legal Risk Audit", "Chat with Document"]
    )
    
    # 3. Document Upload (Only for 'Chat with Document' mode)
    if mode == "Chat with Document":
        st.info("Upload a document to enable context-aware chat.")
        uploaded_file = st.file_uploader("Upload PDF/Image", type=["pdf", "jpg", "png", "jpeg"])
        
        if uploaded_file and st.button("Process for Chat"):
            with st.spinner("Reading document..."):
                files = {"file": (uploaded_file.name, uploaded_file, uploaded_file.type)}
                try:
                    res = requests.post(f"{API_URL}/upload-doc", files=files)
                    if res.status_code == 200:
                        data = res.json()
                        st.session_state.current_doc_id = data["doc_id"]
                        st.success("Document Context Created!")
                        st.caption(f"ID: {data['doc_id']}")
                    else:
                        st.error(f"Error: {res.text}")
                except Exception as e:
                    st.error(f"Connection Failed: {e}")

# --- MAIN APP UI ---
st.title("🏦 FinBot: Data-Driven Banking Assistant")

# ==========================================
# MODE 1 & 3: CHAT INTERFACE
# ==========================================
if mode in ["Standard Banking Chat", "Chat with Document"]:
    
    # Status Banner
    if mode == "Chat with Document":
        if st.session_state.current_doc_id:
            st.success(f"🟢 Context Active (Doc ID: {st.session_state.current_doc_id})")
        else:
            st.warning("🔴 No document active. Please upload one in the sidebar.")

    # 1. Display Chat History
    for message in st.session_state.messages:
        # Map 'model' to 'assistant' for UI
        role = "assistant" if message["role"] == "model" else message["role"]
        
        with st.chat_message(role):
            st.markdown(message["content"])

    # 2. Chat Input Handler
    if prompt := st.chat_input("Ask about loans, banks, or your document..."):
        
        # A. Show User Message Immediately
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # B. Prepare API Payload
        payload = {
            "user_id": st.session_state.user_id,
            "session_id": st.session_state.session_id,  # Sending Session ID
            "message": prompt,
            "history": [] 
        }
        
        # Inject Doc ID if valid
        if mode == "Chat with Document" and st.session_state.current_doc_id:
            payload["doc_id"] = st.session_state.current_doc_id

        # C. Get Bot Response
        with st.chat_message("assistant"):
            with st.spinner("FinBot is thinking..."):
                try:
                    response = requests.post(f"{API_URL}/chat", json=payload)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Extract Data
                        bot_reply = data.get("response", "No text returned")
                        agent_name = data.get("agent_used", "General Agent")
                        process_log = data.get("process_log", "Processing...")

                        # --- NEW: SIDE-BY-SIDE LAYOUT ---
                        col_info, col_ans = st.columns([1, 3])
                        
                        with col_info:
                            # Left Column: Agent Metadata
                            st.info(f"🤖 **{agent_name}**")
                            st.caption(f"⚙️ {process_log}")
                        
                        with col_ans:
                            # Right Column: The Actual Answer
                            st.markdown(bot_reply)

                        # Save interaction to local state
                        st.session_state.messages.append({"role": "model", "content": bot_reply})
                    
                    else:
                        st.error(f"API Error {response.status_code}: {response.text}")
                
                except Exception as e:
                    st.error(f"Connection Error: {e}")

# ==========================================
# MODE 2: LEGAL RISK AUDIT
# ==========================================
elif mode == "Legal Risk Audit":
    st.subheader("⚖️ Legal Document Analyzer")
    st.write("Upload a loan agreement to identify hidden risks, variable rates, and penalty clauses.")
    
    audit_file = st.file_uploader("Upload Document (PDF/Image)", type=["pdf", "jpg", "png"])
    
    if audit_file and st.button("Analyze Risks"):
        with st.spinner("Auditing Document (This may take 15-30 seconds)..."):
            files = {"file": (audit_file.name, audit_file, audit_file.type)}
            try:
                res = requests.post(f"{API_URL}/analyze-doc", files=files)
                
                if res.status_code == 200:
                    data = res.json()
                    analysis_text = data.get("analysis", "No analysis returned.")
                    
                    st.success("Audit Complete")
                    
                    # Show Raw JSON (Optional)
                    with st.expander("View System Data"):
                        st.json(data)
                    
                    # Show Markdown Report
                    st.markdown("### 📋 Analysis Report")
                    st.markdown(analysis_text)
                else:
                    st.error(f"Analysis Failed: {res.text}")
            except Exception as e:
                st.error(f"Connection Error: {e}")