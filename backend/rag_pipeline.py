from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence
from dotenv import load_dotenv

load_dotenv()

embedding_model = OpenAIEmbeddings()

def parse_pdf(file_path):
    loader = PyMuPDFLoader(file_path)
    return loader.load()

def docs_to_string_chunks(docs):
    splitter = RecursiveCharacterTextSplitter(chunk_size=750, chunk_overlap=100)
    chunks = []
    for doc in docs:
        chunks += splitter.split_text(doc.page_content)
    return chunks

def faiss_vectorize_chunks(chunks):
    docs = [Document(page_content=chunk) for chunk in chunks]
    return FAISS.from_documents(docs, embedding_model)

def create_chain():
    rag_prompt_template = """
    You are a reliable expert assistant. Use only the provided context and basic reasoning to answer questions. Do not speculate or fabricate. If the context is insufficient, say you cannot answer.
    
    Context:
    {context}

    Question: {question}
    """
    prompt = PromptTemplate(input_variables=["context", "question"], template=rag_prompt_template)
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)
    return prompt | llm

def get_rag_context(faiss_index, query):
    results = faiss_index.similarity_search(query=query, k=4)
    return "\n\n".join([res.page_content for res in results])