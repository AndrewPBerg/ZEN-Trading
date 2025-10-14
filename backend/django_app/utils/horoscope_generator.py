"""
Horoscope generation utilities for ZEN Trading
Scrapes daily horoscopes and generates financial horoscopes using AI
"""
import os
import json
from datetime import datetime
from pathlib import Path
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the path to horoscope_sites.json
BASE_DIR = Path(__file__).resolve().parent.parent.parent
HOROSCOPE_SITES_PATH = BASE_DIR / "data" / "horoscope_sites.json"


async def scrape_daily_horoscopes():
    """
    Scrape daily horoscopes for all 12 zodiac signs from astrology.com
    
    Returns:
        dict: Dictionary mapping zodiac signs (lowercase) to horoscope text
    """
    # Load zodiac sign URLs from JSON
    with open(HOROSCOPE_SITES_PATH) as f:
        sites = json.load(f)
    
    config = CrawlerRunConfig(
        css_selector="span[style*='font-weight: 400']"
    )
    
    horoscopes = {}
    async with AsyncWebCrawler() as crawler:
        for sign, url in sites.items():
            result = await crawler.arun(url=url, config=config)
            horoscopes[sign] = result.cleaned_html
            
            # Remove HTML tags from the cleaned_html result
            for tag in ["<html>", "</html>", "<body>", "</body>", "<div>", "</div>", 
                       "<span>", "</span>", "\\n", "\\u00a0"]:
                horoscopes[sign] = horoscopes[sign].replace(tag, "")
    
    return horoscopes


def generate_financial_horoscope(daily_horoscopes, today, zodiac_sign, investing_style):
    """
    Generate a financial horoscope for a user based on their zodiac sign and investing style.
    
    Args:
        daily_horoscopes (dict): Dictionary mapping zodiac signs to horoscope text
        today (str): Today's date formatted as "Month, Day"
        zodiac_sign (str): User's zodiac sign (e.g., "Aries")
        investing_style (str): User's investment style description (e.g., "Playful Mystic")
    
    Returns:
        str: Generated financial horoscope text
    """
    # Get the general horoscope text for this zodiac sign
    horoscope_text = daily_horoscopes[zodiac_sign.lower()]
    
    # Create the prompt for financial horoscope generation
    financial_horoscope_prompt = f""" 
        Prompt: Financial Horoscope Generator

        Instruction:
        Write a short, engaging financial horoscope (max 1 paragraph) for a user. The tone should be fun, insightful, and investment-oriented.

        Context:

        Zodiac Sign: {zodiac_sign}

        Date: {today}

        General Horoscope: {horoscope_text}

        Investment Style: {investing_style}

        Task:
        Reframe the general horoscope into a financially aligned version that connects the zodiac traits to stock market behavior, trading mindset, or investment outlook.

        Format:
        Output plain text only.
        Start with:

        Today is {today} (add the cooresponding th or st or rd or nd to the day).
    """
    
    # Set up the prompt template
    prompt_template = PromptTemplate(
        input_variables=["today", "zodiac_sign", "horoscope_text", "investing_style"],
        template=financial_horoscope_prompt
    )
    
    # Set up the Gemini API key
    gemini_key = os.getenv("GEMINI_KEY")
    if gemini_key:
        os.environ["GOOGLE_API_KEY"] = gemini_key
    
    # Set up the Gemini conversational model with LangChain
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=1.0,
        top_p=0.95,
        top_k=20,
    )
    
    # Build an LLMChain
    chain = LLMChain(
        llm=llm,
        prompt=prompt_template
    )
    
    # Generate the financial horoscope
    result = chain.invoke({
        "today": today,
        "zodiac_sign": zodiac_sign,
        "horoscope_text": horoscope_text,
        "investing_style": investing_style
    })
    
    # Extract text from result
    if isinstance(result, dict) and 'text' in result:
        return result['text']
    return str(result)


def get_date_formatted():
    """
    Get today's date formatted as "Month, Day"
    
    Returns:
        str: Date formatted as "October, 13"
    """
    return datetime.now().strftime("%B, %d")


def get_investing_style_display(style_key):
    """
    Convert investing style key to display name
    
    Args:
        style_key (str): Style key like 'casual', 'balanced', etc.
    
    Returns:
        str: Display name like 'Casual Explorer'
    """
    investing_styles = {
        'casual': 'Casual Explorer',
        'balanced': 'Balanced Seeker',
        'profit-seeking': 'Profit Seeker',
        'playful': 'Playful Mystic',
    }
    return investing_styles.get(style_key, style_key)

