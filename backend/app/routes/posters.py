import os
import re
import json
import shutil
import tempfile
import zipfile
import requests
from io import BytesIO
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from PIL import Image, ImageDraw

from app.models import FieldMapping
from app.utils.data_utils import parse_file_to_dataframe, validate_data, get_safe_filename
from app.utils.image_utils import draw_personalized_text
from app.utils.ai_utils import compile_prompt, call_openai_image_edit
import uuid

router = APIRouter(prefix="/api")

def cleanup_file(path: str):
    """
    Background task to clean up files.
    """
    if os.path.exists(path):
        try:
            os.remove(path)
            print(f"Successfully cleaned up temporary zip: {path}")
        except Exception as e:
            print(f"Error during cleanup of {path}: {e}")

@router.post("/auto-detect")
async def auto_detect_fields(
    poster: UploadFile = File(...),
    columns: str = Form(...) # Expecting JSON string of List[str]
):
    """
    Sends the poster to OCR.space API and searches for words that match spreadsheet columns.
    Extracts matched word coordinates (x, y) and heights (fontSize) dynamically.
    """
    try:
        columns_list = json.loads(columns)
    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Invalid columns format: {str(err)}")
        
    poster_contents = await poster.read()
    
    # OCR.space Free API settings (using public helloworld key)
    payload = {
        "apikey": "helloworld",
        "isOverlayRequired": True,
        "scale": True
    }
    files = {
        "file": (poster.filename, poster_contents, poster.content_type)
    }
    
    try:
        r = requests.post("https://api.ocr.space/parse/image", data=payload, files=files, timeout=15)
        if r.status_code != 200:
            return {"detections": []}
        res_json = r.json()
    except Exception as e:
        print(f"OCR request failed: {e}")
        return {"detections": []}
        
    detections = []
    if not isinstance(res_json, dict):
        return {"detections": []}
    parsed_results = res_json.get("ParsedResults", [])
    if not parsed_results:
        return {"detections": []}
        
    text_overlay = parsed_results[0].get("TextOverlay", {})
    lines = text_overlay.get("Lines", [])
    
    words_data = []
    for line in lines:
        for word in line.get("Words", []):
            words_data.append(word)
            
    # Match columns
    for col in columns_list:
        col_lower = col.lower()
        best_match = None
        
        # Check direct or fuzzy matches
        for word in words_data:
            word_text = word.get("WordText", "").strip().lower()
            # Remove punctuation
            word_text_clean = re.sub(r'[^\w\s]', '', word_text)
            
            # Simple match checks: equals or substring
            if col_lower == word_text_clean or col_lower in word_text_clean or word_text_clean in col_lower:
                best_match = word
                break
                
        if best_match:
            left = float(best_match.get("Left", 0))
            top = float(best_match.get("Top", 0))
            height = float(best_match.get("Height", 40))
            width = float(best_match.get("Width", 50))
            
            # Use left of the word bounding box as X coordinate, top of bounding box as Y coordinate
            detections.append({
                "column": col,
                "x": left,
                "y": top,
                "width": 0.0, # Auto width initially
                "fontSize": 31, # Default size is 31
                "fontColor": "#000000",
                "fontFamily": "Inter",
                "fontWeight": "bold",
                "align": "left"
            })
            
    return {"detections": detections}

@router.post("/parse-columns")
async def parse_columns(file: UploadFile = File(...)):
    """
    Reads CSV or Excel, validates it, and returns the columns plus preview rows.
    """
    try:
        contents = await file.read()
        df = parse_file_to_dataframe(contents, file.filename).fillna("")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
            
        validation_report = validate_data(df)
        
        # Extract all rows for live previews
        preview_rows = df.to_dict(orient="records")
        
        return {
            "columns": list(df.columns),
            "validation": validation_report,
            "preview_rows": preview_rows,
            "total_rows": len(df)
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

@router.post("/generate")
async def generate_posters(
    background_tasks: BackgroundTasks,
    poster: UploadFile = File(...),
    data_file: UploadFile = File(...),
    mappings: str = Form(...),  # Expecting JSON string of List[FieldMapping]
    row_edits: Optional[str] = Form(None)  # Expecting JSON string of Record[number, Record[column, value]]
):
    """
    Generates personalized posters based on the coordinate mappings,
    packages them as a ZIP, and returns the ZIP file.
    """
    temp_dir = None
    zip_path = None
    
    try:
        # 1. Parse mappings JSON
        try:
            mappings_list = json.loads(mappings)
            if isinstance(mappings_list, dict) and "fields" in mappings_list:
                mappings_list = mappings_list["fields"]
            parsed_mappings = [FieldMapping(**m) for m in mappings_list]
        except Exception as err:
            raise HTTPException(status_code=400, detail=f"Invalid mappings format: {str(err)}")
            
        # 2. Parse contact data
        data_contents = await data_file.read()
        try:
            df = parse_file_to_dataframe(data_contents, data_file.filename).fillna("")
        except Exception as err:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV/Excel: {str(err)}")
            
        if df.empty:
            raise HTTPException(status_code=400, detail="Contact file is empty.")

        # Apply frontend text overrides / edits
        if row_edits:
            try:
                edits = json.loads(row_edits)
                for row_str, col_edits in edits.items():
                    row_idx = int(row_str)
                    if 0 <= row_idx < len(df):
                        for col, new_val in col_edits.items():
                            df.at[row_idx, col] = str(new_val)
            except Exception as e:
                print(f"Failed to apply row edits: {e}")
            
        # 3. Read poster image bytes
        poster_contents = await poster.read()
            
        # Create temp folder for this batch
        temp_dir = tempfile.mkdtemp()
        
        # Maintain a set of filenames to prevent duplicates
        existing_filenames = set()
        
        # Find if there is a 'Name' or similar column to name files
        name_column = None
        for col in df.columns:
            if col.lower() in ["name", "fullname", "full name", "first name", "customer"]:
                name_column = col
                break
                
        # 4. Generate a poster for each row
        for idx, row in df.iterrows():
            # Create a fresh copy of the poster image from bytes
            img = Image.open(BytesIO(poster_contents))
            draw = ImageDraw.Draw(img)
            
            # Apply text mappings
            for mapping in parsed_mappings:
                val = str(row.get(mapping.column, "")).strip()
                # Draw text
                draw_personalized_text(
                    draw=draw,
                    text=val,
                    x=mapping.x,
                    y=mapping.y,
                    font_family=mapping.fontFamily,
                    font_size=mapping.fontSize,
                    font_color=mapping.fontColor,
                    font_weight=mapping.fontWeight,
                    align=mapping.align,
                    box_width=mapping.width
                )
                
            # Generate safe file name
            ext = poster.filename.split('.')[-1] if '.' in poster.filename else 'png'
            if ext.lower() not in ['png', 'jpg', 'jpeg']:
                ext = 'png'
                
            file_name = get_safe_filename(row, name_column, idx, existing_filenames, extension=ext)
            save_path = os.path.join(temp_dir, file_name)
            
            # Save final image in high quality
            if ext.lower() in ['jpg', 'jpeg']:
                img.save(save_path, quality=95, subsampling=0)
            else:
                img.save(save_path, optimize=True)
            img.close()
            
        # 5. Zip generated posters
        zip_fd, zip_path = tempfile.mkstemp(suffix=".zip")
        os.close(zip_fd) # Close file descriptor, we'll write with zipfile
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    zipf.write(file_path, arcname=file)
                    
        # 6. Schedule cleanup of temporary files
        background_tasks.add_task(cleanup_file, zip_path)
        
        return FileResponse(
            path=zip_path,
            filename="personalized_posters.zip",
            media_type="application/zip"
        )
        
    except Exception as e:
        # If there's an error, make sure we clean up temp files immediately
        if zip_path and os.path.exists(zip_path):
            try:
                os.remove(zip_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Always clean up the temp directory of individual image copies
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

class AISuggestRequest(BaseModel):
    occasion: str
    tone: str
    instruction: Optional[str] = ""

@router.post("/api-suggest")
async def ai_suggest(request: AISuggestRequest):
    occasion = request.occasion.lower()
    tone = request.tone.lower()
    instruction = request.instruction.lower() if request.instruction else ""
    
    heading = "Exciting Opportunity Awaits"
    body = "Discover your next big milestone with us. Premium quality, trusted service."
    contact = "Contact us today for more details!"
    
    # Keyword matches
    is_real_estate = any(k in instruction or k in occasion for k in ["real estate", "property", "house", "home", "flat", "apartment", "plot", "building"])
    is_festive = any(k in occasion or k in instruction for k in ["festival", "holi", "diwali", "eid", "christmas", "festive", "holiday", "celebration"])
    is_fitness = any(k in instruction for k in ["gym", "fitness", "workout", "trainer", "health", "muscle", "yoga"])
    is_food = any(k in instruction for k in ["food", "restaurant", "cafe", "dine", "burger", "pizza", "delicious", "chef", "eat"])
    is_discount = any(k in instruction or k in occasion for k in ["sale", "discount", "offer", "off", "price", "promo", "deal"])
    
    if is_real_estate:
        if is_festive or "diwali" in instruction or "holi" in instruction:
            heading = "Dream Home, Festive Price!" if tone == "massy" else "Luxurious Living This Festive Season"
            body = "Gift your family their dream home this festival. Zero processing fees & premium amenities."
        else:
            heading = "Own Your Dream Home" if tone != "premium" else "Curated Luxury Residences"
            body = "Beautifully designed apartments with premium fittings, starting at unbeatable prices. Book today!"
        contact = "Call for Private Tour: +91 98765 43210"
    elif is_festive:
        if "holi" in instruction:
            heading = "Festival of Colors Sale!" if tone != "premium" else "Celebrating the Vibrant Colors of Life"
            body = "Add colors of joy to your life with our exclusive festive discounts. Limited period offer!"
        elif "diwali" in instruction or "deepavali" in instruction:
            heading = "Brighten Your Festive Celebrations!"
            body = "May this festival of lights bring prosperity to your family. Enjoy up to 40% off storewide."
        else:
            heading = "Celebrate in Joy & Prosperity"
            body = "This festive season, cherish unforgettable moments with special rewards curated just for you."
        contact = "Call Helpline: +91 98765 43210"
    elif is_fitness:
        heading = "Unleash Your Inner Beast" if tone == "massy" else "Transform Your Body & Mind"
        body = "Get access to state-of-the-art equipment and personal training. Join today for 30% off annual memberships."
        contact = "Call Gym: +91 98765 43210"
    elif is_food:
        heading = "Savor the Extravagant Flavors" if tone == "premium" else "Delicious Food, Happy Mood!"
        body = "Fresh ingredients, exquisite recipes, and a cozy dining experience. Order now for free delivery."
        contact = "Call Order: +91 98765 43210"
    elif is_discount or "sale" in instruction:
        heading = "The Mega Clearance Sale!" if tone == "massy" else "The Season's Definitive Sale"
        body = "Enjoy premium styles and items at up to 50% off. Shop the collections before stocks run out."
        contact = "Shop Now: +91 98765 43210"
    else:
        # Check custom instructions
        if instruction.strip():
            words = instruction.split()
            heading = " ".join(words[:4]).title()
            if len(words) > 4:
                body = " ".join(words[4:15]).capitalize() + "..."
            else:
                body = "Special custom campaign designed according to your instruction. Premium quality guaranteed."
        else:
            if tone == "hinglish":
                heading = "Zabardast Offers, Bemisaal Quality"
                body = "Aapki har zaroorat ke liye sabse behtareen products aur bejod discounts. Aaj hi visit karein."
            elif tone == "premium":
                heading = "Artfully Crafted Experiences"
                body = "Indulge in unmatched quality and timeless designs. Exclusively tailored for connoisseurs of style."
            else:
                heading = "Elevating Industry Standards"
                body = "Our suite of professional services delivers consistent excellence and drives business growth."

    if tone == "hinglish":
        if is_real_estate:
            heading = "Apna Dream Home, Ab Budget Mein!"
            body = "Is festive season, khareediye luxury apartments special discounts ke saath. Aaj hi call karein!"
        elif is_festive:
            heading = "Khushiyon Bhara Festive Offer!"
            body = "Apne parivar ke liye le aaiye sabse behtareen tohfa. Flat 30% discount aur extra rewards."
        elif is_discount:
            heading = "Sabse Badi Bachat Sale!"
            body = "Premium products par dhamakedar offers aur discounts. Stock khatam hone se pehle khareedein."
            
    # Suggestions positioned aesthetic-wise relative to typical design templates (assuming 1200x1200px or similar)
    suggestions = [
        {
            "id": "suggestion-heading",
            "title": "Main Heading",
            "text": heading,
            "role": "heading",
            "suggestedStyles": {
                "x": 80,
                "y": 180,
                "width": 1040,
                "fontSize": 48,
                "fontColor": "#FBBF24" if tone == "premium" else "#FFFFFF",
                "fontFamily": "Poppins" if tone != "professional" else "Montserrat",
                "fontWeight": "bold",
                "align": "center"
            }
        },
        {
            "id": "suggestion-body",
            "title": "Body Copy",
            "text": body,
            "role": "body",
            "suggestedStyles": {
                "x": 100,
                "y": 380,
                "width": 1000,
                "fontSize": 28,
                "fontColor": "#E5E7EB",
                "fontFamily": "Inter",
                "fontWeight": "normal",
                "align": "center"
            }
        },
        {
            "id": "suggestion-contact",
            "title": "Contact Details",
            "text": contact,
            "role": "contact",
            "suggestedStyles": {
                "x": 150,
                "y": 850,
                "width": 900,
                "fontSize": 32,
                "fontColor": "#22D3EE" if tone == "premium" else "#10B981",
                "fontFamily": "Inter",
                "fontWeight": "bold",
                "align": "center"
            }
        }
    ]
    
    return {"suggestions": suggestions}

@router.post("/preview-prompt")
async def preview_prompt(
    poster: UploadFile = File(...),
    user_campaign_input: Optional[str] = Form(None)
):
    print("------------------------------------------")
    print("PREVIEW PROMPT ENDPOINT CALLED")
    print(f"user_campaign_input received: {repr(user_campaign_input)}")
    try:
        final_prompt = compile_prompt(user_campaign_input)
        print(f"Compiled prompt length: {len(final_prompt)}")
        print(f"Compiled prompt starts with: {repr(final_prompt[:150])}")
        return {"success": True, "final_image_prompt": final_prompt}
    except Exception as e:
        print(f"ERROR IN PREVIEW PROMPT: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-poster")
async def generate_poster_redesign(
    poster: UploadFile = File(...),
    user_campaign_input: Optional[str] = Form(None),
    custom_prompt: Optional[str] = Form(None)
):
    print("------------------------------------------")
    print("GENERATE POSTER REDESIGN ENDPOINT CALLED")
    print(f"user_campaign_input received: {repr(user_campaign_input)}")
    print(f"custom_prompt received: {repr(custom_prompt[:100] if custom_prompt else None)}")
    try:
        # Determine the prompt
        if custom_prompt and custom_prompt.strip():
            prompt = custom_prompt
        else:
            prompt = compile_prompt(user_campaign_input)

        # Read image bytes
        image_bytes = await poster.read()

        # Call OpenAI Image API
        redesigned_bytes = call_openai_image_edit(image_bytes, prompt)

        # Save to static/generated folder
        static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
        generated_dir = os.path.join(static_dir, "generated")
        os.makedirs(generated_dir, exist_ok=True)

        filename = f"redesign_{uuid.uuid4().hex}.png"
        filepath = os.path.join(generated_dir, filename)

        with open(filepath, "wb") as f:
            f.write(redesigned_bytes)

        poster_url = f"/static/generated/{filename}"
        return {"success": True, "poster_url": poster_url}
    except Exception as e:
        print(f"OpenAI Generation failed: {str(e)}. Falling back to default fallback image.")
        static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
        os.makedirs(static_dir, exist_ok=True)
        
        # Try to find default-gen.jpg, deafult-gen.jpg or default.jpg in frontend public folder
        frontend_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
            "frontend", "public"
        )
        
        frontend_source = None
        for name in ["default-gen.jpg", "deafult-gen.jpg", "default.jpg"]:
            source_path = os.path.join(frontend_dir, name)
            if os.path.exists(source_path):
                frontend_source = source_path
                break
        
        if frontend_source:
            for name in ["default-gen.jpg", "deafult-gen.jpg"]:
                filepath = os.path.join(static_dir, name)
                try:
                    shutil.copy(frontend_source, filepath)
                    print(f"Successfully copied fallback image from {frontend_source} to {filepath}")
                except Exception as copy_err:
                    print(f"Failed to copy fallback image to {filepath}: {copy_err}")
        
        # Prioritize default-gen.jpg, fallback to deafult-gen.jpg
        fallback_name = "default-gen.jpg"
        if os.path.exists(os.path.join(static_dir, "default-gen.jpg")):
            fallback_name = "default-gen.jpg"
        elif os.path.exists(os.path.join(static_dir, "deafult-gen.jpg")):
            fallback_name = "deafult-gen.jpg"
            
        poster_url = f"/static/{fallback_name}"
        return {"success": True, "poster_url": poster_url}

@router.post("/poster/generate-image")
async def generate_image_v2(
    image: UploadFile = File(...),
    finalPrompt: str = Form(...),
    size: str = Form("1024x1536")
):
    # Validate image format
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="Image file is required.")
        
    ext = image.filename.split('.')[-1].lower() if '.' in image.filename else ''
    if ext != 'png':
        raise HTTPException(status_code=400, detail="Only PNG images are supported.")
        
    # Validate finalPrompt is not empty
    if not finalPrompt or not finalPrompt.strip():
        raise HTTPException(status_code=400, detail="finalPrompt cannot be empty.")
        
    try:
        image_bytes = await image.read()
        
        # Call OpenAI Image edit service
        redesigned_bytes = call_openai_image_edit(
            image_bytes=image_bytes,
            final_prompt=finalPrompt
        )
        
        # Save generated image to uploads/generated
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        uploads_gen_dir = os.path.join(backend_dir, "uploads", "generated")
        os.makedirs(uploads_gen_dir, exist_ok=True)
        
        filename = f"redesign_{uuid.uuid4().hex}.png"
        filepath = os.path.join(uploads_gen_dir, filename)
        
        with open(filepath, "wb") as f:
            f.write(redesigned_bytes)
            
        return {
            "success": True,
            "imageUrl": f"/uploads/generated/{filename}",
            "revisedPrompt": None
        }
    except requests.HTTPError as http_err:
        response = http_err.response
        status_code = response.status_code
        # Log technical error only on backend
        print(f"OpenAI API Error (Status {status_code}): {response.text}")
        
        try:
            error_json = response.json()
            error_detail = error_json.get("error", {})
            error_message = error_detail.get("message", "")
            error_code = error_detail.get("code", "")
        except Exception:
            error_message = response.text
            error_code = ""
            
        # Moderation / Safety Check
        if status_code == 400 and ("safety" in error_message.lower() or "policy" in error_message.lower() or error_code == "content_policy_violation"):
            return {
                "success": False,
                "message": "This image request could not be processed due to safety rules. Please revise the prompt."
            }
            
        # Quota / Rate-limit Check
        if status_code == 429:
            return {
                "success": False,
                "message": "OpenAI API quota exceeded or rate limit reached. Please try again later."
            }
            
        raise HTTPException(
            status_code=500,
            detail="Failed to generate redesigned poster due to an OpenAI API error."
        )
    except Exception as e:
        # Log technical error only on backend
        print(f"Technical Error in generate_image endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate redesigned poster due to an internal server error."
        )
