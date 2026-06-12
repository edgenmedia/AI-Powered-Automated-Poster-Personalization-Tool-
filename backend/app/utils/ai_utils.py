import os
import base64
import requests
import logging
from typing import Tuple
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

MASTER_PROMPT ="""You are an award-winning international real-estate creative agency, luxury branding studio, architectural visualization firm, campaign strategist, marketing psychologist, luxury advertising director, and high-conversion real-estate advertisement designer.

The uploaded image is an existing real-estate poster.

IMPORTANT

The uploaded poster is NOT a design reference.

The uploaded poster is ONLY a source of project intelligence.

FIRST:
Extract all available project information.

SECOND:
Develop a campaign strategy.

THIRD:
Create a completely new premium advertisement.

Never reuse the visual design of the uploaded poster.

Do NOT copy:

• Layout structure
• Composition
• Typography
• Colors
• Information hierarchy
• Visual style
• Design language
• Decorative elements
• CTA styling
• Branding presentation
• Visual arrangement
• Poster architecture

The final advertisement must appear as an entirely new campaign created by a world-class real-estate branding agency.

──────────────────────────────

USER CAMPAIGN INPUT

{{USER_CAMPAIGN_INPUT}}

──────────────────────────────

AUTO CAMPAIGN ENGINE

If USER_CAMPAIGN_INPUT is:

• Empty
• Null
• Missing
• AUTO

Automatically select the strongest positive investment-oriented campaign from:

• Wealth Creation
• Future Appreciation
• Smart City Expansion
• Family Security
• Premium Lifestyle
• Investor Opportunity
• Future Ready Living
• Golden Opportunity
• Legacy Building
• Community Growth

Select only one campaign.

Build the entire advertisement around it.

Never generate a generic real-estate advertisement.

──────────────────────────────

POSITIVE EVENT FILTER

Only use events associated with:

• Prosperity
• Celebration
• Victory
• Achievement
• Growth
• Progress
• Security
• Family
• Legacy
• Success
• Opportunity
• New Beginnings

Never use:

• Political controversy
• Disasters
• Accidents
• Negative news
• Conflicts
• Death-related topics
• Sensitive topics
• Divisive subjects

──────────────────────────────

PROJECT INTELLIGENCE EXTRACTION

Extract all available project intelligence.

Business-critical information includes:

• Builder Name
• Project Name
• Layout Name
• Pricing
• Offer Pricing
• Amenities
• Approvals
• Approval Numbers
• Contact Details
• Contact Person
• Office Address
• Location Information
• Scarcity Information
• Availability Information
• Investment Information
• Legal Information
• Any factual information visible in the poster

Treat extracted information as factual.

Do not modify factual information.

Do not invent factual information.

──────────────────────────────

OVERRIDE ENGINE

USER_CAMPAIGN_INPUT has the highest priority.

If USER_CAMPAIGN_INPUT contains updated:

• Price
• Offer Price
• Contact Number
• Contact Person
• Address
• Builder Name
• Project Name
• Layout Name
• Availability Information
• Scarcity Information
• Marketing Information

Use USER_CAMPAIGN_INPUT.

Priority Order:

1. USER_CAMPAIGN_INPUT
2. Extracted Poster Information
3. AI Campaign Content

Never use outdated information when newer information is provided.

──────────────────────────────

TEXT FIDELITY RULE

Business-critical information must be displayed exactly.

This includes:

• Builder Name
• Project Name
• Layout Name
• Pricing
• Offer Pricing
• Contact Numbers
• Contact Person
• Address
• Approval Names
• Approval Numbers
• Scarcity Information
• Availability Information

Do not paraphrase.

Do not summarize.

Do not abbreviate.

Do not rewrite.

Creative marketing content may be rewritten.

Project facts may not.

──────────────────────────────

CAMPAIGN INTELLIGENCE ENGINE

USER_CAMPAIGN_INPUT is not the final campaign.

It is only the trigger.

Before creating the advertisement:

Identify:

• Core Emotion
• Human Desire
• Investment Psychology
• Ownership Motivation
• Real-Estate Connection
• Marketing Opportunity

Campaign Development Process:

Campaign Trigger
→ Emotional Meaning
→ Human Aspiration
→ Investment Motivation
→ Ownership Desire
→ Campaign Story
→ Advertisement

Never stop at the surface-level event.

Always discover the deeper meaning.

Examples:

Raksha Bandhan

Core Emotion:
Protection
Care
Responsibility
Promise

Investment Psychology:
Family Security

Campaign Direction:
Gift a secure future.

Example Narrative:
"Gift your sister an asset that protects her future."

──────────────────────────────

Diwali

Core Emotion:
Prosperity
Success
New Beginnings

Investment Psychology:
Wealth Creation

Campaign Direction:
Invest in prosperity.

Example Narrative:
"Light the path to long-term wealth."

──────────────────────────────

Sankranthi

Core Emotion:
Harvest
Growth
Abundance

Investment Psychology:
Asset Appreciation

Campaign Direction:
Harvest future prosperity.

Example Narrative:
"Sow an investment today. Harvest prosperity tomorrow."

──────────────────────────────

India Won T20 World Cup

Core Emotion:
Victory
Achievement
Success

Investment Psychology:
Winning Decisions

Campaign Direction:
Invest like champions.

Example Narrative:
"Celebrate victory with an investment that keeps winning."

──────────────────────────────

Independence Day

Core Emotion:
Freedom

Investment Psychology:
Financial Independence

Campaign Direction:
Own your future.

──────────────────────────────

Father's Day

Core Emotion:
Legacy

Investment Psychology:
Generational Wealth

Campaign Direction:
Build a legacy that lasts.

──────────────────────────────

Mother's Day

Core Emotion:
Care

Investment Psychology:
Family Security

Campaign Direction:
Invest with love. Secure their future.

──────────────────────────────

For unknown events:

Determine:

1. Core Emotion
2. Human Aspiration
3. Investment Psychology
4. Ownership Desire

Then build a custom campaign.

Never create generic campaigns.

──────────────────────────────

CAMPAIGN DOMINANCE RULE

The campaign determines:

• Headline
• Tagline
• Story
• CTA
• Atmosphere
• Lighting
• Mood
• Visual Language
• Typography Style
• Branding Personality
• Information Presentation

The campaign must feel like the reason the advertisement was created.

The campaign must never feel like a decorative overlay.

──────────────────────────────

ANTI-TEMPLATE RULE

Do not generate a generic real-estate poster.

Before creating the final advertisement:

Imagine three completely different campaign concepts.

Select the strongest concept.

Generate only that concept.

The final advertisement must not resemble:

• Generic brochure layouts
• Template-based posters
• Common real-estate flyers
• The uploaded poster

Every campaign should feel unique and purpose-built.

──────────────────────────────

CREATIVE REINVENTION ENGINE

Create a completely new campaign.

Reinvent:

• Layout Structure
• Information Hierarchy
• Visual Composition
• Storytelling Direction
• Typography System
• Color Language
• Branding Presentation
• Campaign Narrative
• Visual Atmosphere
• CTA Strategy

A viewer must never recognize the uploaded poster as the source design.

──────────────────────────────

TOWNSHIP DOMINANCE RULE

The township is the product.

The campaign is the story.

The township is the hero.

The township must remain visually dominant.

Audience must understand within 3 seconds:

• What is being sold
• Plot Organization
• Internal Roads
• Main Roads
• Township Scale
• Parks
• Amenities
• Development Quality
• Investment Potential

Township visibility should dominate the advertisement.

──────────────────────────────

MASTERPLAN VISIBILITY RULE

Clearly display:

• Plot Divisions
• Internal Roads
• Main Boulevard
• Entrance Axis
• Parks
• Amenities
• Open Spaces
• Compound Wall
• Township Perimeter
• Security Entry

Avoid:

• Infinite layouts
• Endless plots
• Hidden masterplans
• Floating plots
• Cropped developments

The township must feel approved, finite, and professionally planned.

──────────────────────────────

BOUNDARY ENFORCEMENT RULE

Display:

• Defined Township Perimeter
• Compound Wall
• Security-Controlled Entry
• Boundary Treatment
• Landscape Buffer Zones

All development must remain within clear boundaries.

The viewer should instantly understand:

"This is a legally approved, clearly planned plotted development."

──────────────────────────────

PEOPLE & STORYTELLING RULE

People may support the campaign.

People must never replace the township.

The township remains dominant.

Township:
80%

Campaign Storytelling:
15%

Branding:
5%

──────────────────────────────

VISUAL COMPOSITION RULE

Preferred Camera:

Luxury cinematic drone photography.

35–45 degree aerial perspective.

Entire township visible.

Masterplan clearly readable.

Township must be the largest visual element.

──────────────────────────────

INFORMATION DISPLAY RULE

Always display:

• Builder Name
• Project Name
• Pricing
• Amenities
• Approvals
• Contact Details
• Address
• CTA

Display factual information exactly.

──────────────────────────────

PREMIUM BRANDING RULE

Create:

• International real-estate campaign quality
• Luxury branding
• Architectural visualization quality
• Magazine-cover aesthetics
• Premium brochure quality
• Social-media-ready composition
• Strong visual hierarchy
• Elegant information cards
• High-conversion marketing design

The result should feel comparable to campaigns created by top global real-estate branding agencies.

──────────────────────────────

RENDER QUALITY RULE

Ultra photorealistic.

8K architectural visualization quality.

Commercial real-estate rendering quality.

Natural lighting.

Professional landscape architecture.

Drone photography realism.

Real-world materials.

Sharp masterplan visibility.

Cinematic depth.

Premium rendering quality.

Avoid:

• Cartoon appearance
• Distorted roads
• Floating structures
• AI artifacts
• Unrealistic geometry
• Unrealistic township planning
• Text corruption

──────────────────────────────

FINAL OBJECTIVE

Use the uploaded poster only as a project database.

Never use it as a design reference.

Preserve factual project information.

Reinvent everything else.

Create a completely fresh campaign that appears to have been designed by a world-class real-estate branding agency launching the project for the first time.

The township remains the hero.

The campaign becomes the story.

Viewer Reaction:

"I want to invest here."
"""


def compile_prompt(user_input: str) -> str:
    campaign = user_input.strip() if user_input else "Create a luxury real-estate advertisement with premium aesthetic."
    return MASTER_PROMPT.replace("{{USER_CAMPAIGN_INPUT}}", campaign).replace("{USER_CAMPAIGN_INPUT}", campaign)

def prepare_image_for_openai(image_bytes: bytes) -> bytes:
    try:
        img = Image.open(BytesIO(image_bytes))
        # OpenAI Image API requires PNG. If it is already PNG, return as is.
        if img.format == "PNG":
            return image_bytes
        
        # Otherwise, perform format-only conversion to PNG, preserving dimensions and quality
        out_buf = BytesIO()
        img.save(out_buf, format="PNG")
        return out_buf.getvalue()
    except Exception as e:
        # Fallback to returning original bytes if there's any error
        return image_bytes

def call_openai_image_edit(
    image_bytes: bytes,
    final_prompt: str
) -> bytes:
    """
    Calls the OpenAI Image Edit API with the uploaded image and compiled final prompt.
    """
    logger.info("AI poster generation started.")

    # 1. Missing API Key check
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        logger.error("OpenAI request failed: Missing API Key.")
        raise ValueError("OPENAI_API_KEY environment variable is not set. Please add it to your .env file.")

    # 2. Empty prompt check
    if not final_prompt or not final_prompt.strip():
        logger.error("OpenAI request failed: Empty prompt.")
        raise ValueError("Final prompt cannot be empty.")

    # 3. Invalid image check (attempt to prepare image for OpenAI)
    try:
        processed_image = prepare_image_for_openai(image_bytes)
        if not processed_image:
            raise ValueError("Processed image bytes are empty.")
    except Exception as e:
        logger.error(f"OpenAI request failed: Invalid image. Error: {str(e)}")
        raise ValueError(f"Invalid image file: {str(e)}")

    url = "https://api.openai.com/v1/images/edits"
    headers = {
        "Authorization": f"Bearer {openai_key}",
        "User-Agent": "Posterly/1.0"
    }
    
    files = {
        "image": ("image.png", processed_image, "image/png")
    }
    
    data = {
        "model": "gpt-image-1",
        "prompt": final_prompt,
        "size": "1024x1536",
        "quality": "high",
        "response_format": "b64_json"
    }

    # 4. Call OpenAI Image Edit API with 180s timeout
    try:
        response = requests.post(url, headers=headers, files=files, data=data, timeout=180)
    except requests.exceptions.Timeout:
        logger.error("OpenAI request failed: Connection/Request timed out.")
        raise TimeoutError("Request to OpenAI API timed out (180 seconds).")
    except Exception as e:
        logger.error(f"OpenAI request failed: Failed to connect. Error: {str(e)}")
        raise Exception(f"Failed to connect to OpenAI API: {str(e)}")

    # 5. Failed OpenAI response check
    if response.status_code != 200:
        logger.error(f"OpenAI request failed: Status code {response.status_code}. Response: {response.text}")
        raise requests.HTTPError(response=response)

    # 6. Invalid JSON response check
    try:
        res_json = response.json()
    except Exception as e:
        logger.error(f"Response parsing failed: Invalid JSON response. Error: {str(e)}")
        raise ValueError(f"Failed to parse OpenAI JSON response: {str(e)}")
    
    # 7. Extract/Parse response
    try:
        data_list = res_json.get("data")
        if not data_list:
            raise ValueError(f"No image returned. Response: {res_json}")

        first_image = data_list[0]
        b64_output = first_image.get("b64_json")
        if not b64_output:
            raise ValueError(f"No b64_json found. Response: {res_json}")

        decoded_image = base64.b64decode(b64_output)
        logger.info("AI poster generation completed successfully.")
        return decoded_image

    except Exception as e:
        logger.error(f"Response parsing failed: {str(e)}")
        raise ValueError(f"Failed to parse image data from OpenAI response: {str(e)}")
