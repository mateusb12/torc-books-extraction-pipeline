from pydantic import BaseModel, HttpUrl
from typing import Optional

class BookPreview(BaseModel):
    """
    Data extracted from the listing pages (category/pagination)
    """
    title: str
    price: str
    rating: Optional[str] = None
    detail_page_url: HttpUrl


class BookDetails(BaseModel):
    """
    Deeper data extracted from the book detail page
    """
    description: Optional[str] = None
    upc: Optional[str] = None
    availability: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    category: Optional[str] = None


class FullBook(BaseModel):
    """
    Final unified dataset combining both listing and detail data
    """
    title: str
    price: str
    rating: Optional[str] = None
    detail_page_url: HttpUrl

    description: Optional[str] = None
    upc: Optional[str] = None
    availability: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    category: Optional[str] = None


class ExtractionResult(BaseModel):
    """
    Represents the final output JSON file structure
    Useful for writing to disk or returning via an endpoint
    """
    total_books: int
    books: list[FullBook]
