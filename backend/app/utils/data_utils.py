import io
import re
import pandas as pd
from typing import Dict, Any, List, Optional

def parse_file_to_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """
    Parses CSV or Excel bytes into a Pandas DataFrame.
    """
    if filename.lower().endswith('.csv'):
        # Try reading CSV with utf-8 first, fallback to latin-1
        try:
            return pd.read_csv(io.BytesIO(file_bytes), dtype=str)
        except Exception:
            return pd.read_csv(io.BytesIO(file_bytes), encoding='latin-1', dtype=str)
    elif filename.lower().endswith(('.xlsx', '.xls')):
        return pd.read_excel(io.BytesIO(file_bytes), dtype=str)
    else:
        raise ValueError("Unsupported file format. Please upload a CSV or Excel (.xlsx/.xls) file.")

def validate_phone(val: Any) -> bool:
    """
    Validates standard phone number formats.
    Allows digits, spaces, dashes, parentheses, dots, and optional leading '+'.
    Length of actual digits should be between 7 and 15.
    Also handles Excel float representation (e.g. 1234567890.0) by stripping '.0'.
    """
    if pd.isna(val) or not str(val).strip():
        return False
    val_str = str(val).strip()
    if val_str.endswith(".0"):
        val_str = val_str[:-2]
    cleaned = re.sub(r'[\s\-\(\)\+\.]', '', val_str)
    return cleaned.isdigit() and (7 <= len(cleaned) <= 15)

def validate_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validates a DataFrame for empty fields and phone-like columns.
    Returns details about empty cell counts (with indices) and phone validation flags.
    """
    validation_report = {
        "total_rows": len(df),
        "columns": list(df.columns),
        "empty_counts": {},  # column -> { "count": int, "empty_rows": [indices] }
        "phone_validation": {}  # column -> { "is_phone_col": bool, "invalid_rows": [indices] }
    }
    
    # Fill NaN with empty strings for easier checking
    df_filled = df.fillna("")
    
    for col in df.columns:
        # Check empty cells
        empty_mask = df_filled[col].astype(str).str.strip() == ""
        empty_indices = [int(idx) for idx, is_empty in enumerate(empty_mask) if is_empty]
        empty_count = len(empty_indices)
        if empty_count > 0:
            validation_report["empty_counts"][col] = {
                "count": empty_count,
                "empty_rows": empty_indices[:20]  # limit to first 20 for preview
            }
            
        # Check if it looks like a phone number column by header name (exact words)
        col_lower = col.lower()
        words = re.findall(r'\b[a-zA-Z0-9]+\b', col_lower.replace('_', ' '))
        
        is_phone_candidate = any(kw in words for kw in ["phone", "mobile", "contact", "tel", "cell", "telephone"])
        
        # Exclude names, persons, emails, addresses, ids, companies to avoid false matches (e.g. Contact Name)
        if is_phone_candidate:
            exclusions = ["name", "person", "email", "address", "company", "id"]
            if any(ex in words for ex in exclusions):
                is_phone_candidate = False
        
        if is_phone_candidate:
            invalid_indices = []
            for idx, val in enumerate(df[col]):
                val_str = str(val).strip() if not pd.isna(val) else ""
                if val_str and not validate_phone(val_str):
                    invalid_indices.append(idx)
            
            validation_report["phone_validation"][col] = {
                "is_phone_col": True,
                "invalid_count": len(invalid_indices),
                "invalid_rows": invalid_indices[:20]  # limit to first 20 for preview
            }
            
    return validation_report

def get_safe_filename(row: pd.Series, name_col: Optional[str], index: int, existing_names: set, extension: str = "png") -> str:
    """
    Generates a unique, OS-safe filename.
    Uses name_col value if available, otherwise falls back to index.
    """
    base_name = ""
    if name_col and name_col in row and not pd.isna(row[name_col]):
        val = str(row[name_col]).strip()
        if val:
            # Strip out any non-alphanumeric/spaces/dashes
            base_name = re.sub(r'[^a-zA-Z0-9\s\-_]', '', val)
            base_name = base_name.replace(' ', '_')
            
    if not base_name:
        base_name = f"poster_{index + 1}"
        
    candidate = base_name
    counter = 1
    # Avoid collisions
    while candidate.lower() in existing_names:
        candidate = f"{base_name}_{counter}"
        counter += 1
        
    existing_names.add(candidate.lower())
    return f"{candidate}.{extension}"
