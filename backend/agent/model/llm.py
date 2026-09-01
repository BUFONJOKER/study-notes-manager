from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()


def load_llm():
    """
    Load the LLM model using the OpenAI API key from the environment variable.
    """
    return ChatOpenAI(
        model="gpt-5-nano",
        temperature=0,
    )
