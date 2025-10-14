from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import os
from datetime import datetime
import json
import asyncio
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
import sys

# Load environment variables from .env file
load_dotenv()

sys.path.append("./backend")

async def scrape_daily_horoscopes():
    # Load zodiac sign URLs from JSON
    with open("../backend/data/horoscope_sites.json") as f:
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
            for tag in ["<html>", "</html>", "<body>", "</body>", "<div>", "</div>", "<span>", "</span>", "\\n", "\\u00a0"]:
                horoscopes[sign] = horoscopes[sign].replace(tag, "")
    
    return horoscopes


# Set the Gemini API key in the environment (for langchain-google-genai)
GEMINI_KEY = os.getenv("GEMINI_KEY")
if GEMINI_KEY:
    os.environ["GOOGLE_API_KEY"] = GEMINI_KEY

def generate_financial_horoscope(daily_horoscopes, today, zodiac_sign, investing_style):
    """
    Generate a financial horoscope for a user based on their zodiac sign and investing style.
    
    Args:
        daily_horoscopes (dict): Dictionary mapping zodiac signs to horoscope text
        today (str): Today's date formatted as "Month, Day"
        zodiac_sign (str): User's zodiac sign (e.g., "Aries")
        investing_style (str): User's investment style description (e.g., "Playful Mystic")
    
    Returns:
        dict: LLM result containing the generated financial horoscope
    """
    horoscope_text = daily_horoscopes[zodiac_sign.lower()]




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



    # Set up the prompt
    prompt_template = PromptTemplate(
        input_variables=[today, zodiac_sign, horoscope_text, investing_style],
        template=financial_horoscope_prompt
    )

    # Set up the Gemini conversational image generation model with LangChain.
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
    return result

def get_date():
    return datetime.now().strftime("%B, %d")




if __name__ == "__main__":
    # Mapping of investing style keys to descriptions
    investing_styles = {
        'casual': 'Casual Explorer',
        'balanced': 'Balanced Seeker',
        'profit-seeking': 'Profit Seeker',
        'playful': 'Playful Mystic',
    }
    
    # Get the date
    today = get_date()
    
    # Scrape daily horoscopes once
    daily_horoscopes = asyncio.run(scrape_daily_horoscopes())
    
    # Example: Generate horoscope for Aries with Playful Mystic style
    zodiac_sign = "Aries"
    investing_style = investing_styles["playful"]
    
    result1 = generate_financial_horoscope(daily_horoscopes, today, zodiac_sign, investing_style)

    # Generate another one with different parameters
    zodiac_sign = "Aries"
    investing_style = investing_styles["balanced"]
    result2 = generate_financial_horoscope(daily_horoscopes, today, zodiac_sign, investing_style)

    # Generate another one with different parameters
    zodiac_sign = "Aries"
    investing_style = investing_styles["profit-seeking"]
    result3 = generate_financial_horoscope(daily_horoscopes, today, zodiac_sign, investing_style)
    print(result1['text'] if isinstance(result1, dict) and 'text' in result1 else result1)
    print(result2['text'] if isinstance(result2, dict) and 'text' in result2 else result2)
    print(result3['text'] if isinstance(result3, dict) and 'text' in result3 else result3)




