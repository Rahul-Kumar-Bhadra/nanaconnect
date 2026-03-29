from pydantic import BaseModel, model_validator
from typing import Optional

class PujaCategoryCreate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    pujaType: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = "🙏"
    imageUrl: Optional[str] = None
    imageURL: Optional[str] = None
    category: Optional[str] = None

    model_config = {"extra": "ignore"}

    @model_validator(mode="after")
    def normalize(self):
        if not self.name:
            self.name = self.title or self.pujaType or "Puja"
        if not self.image or self.image == "🙏":
            if self.imageUrl:
                self.image = self.imageUrl
            elif self.imageURL:
                self.image = self.imageURL
        if not self.image:
            self.image = "🙏"
        return self

    def to_db_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "duration": str(self.duration) if self.duration else None,
            "price": float(self.price) if self.price else 0.0,
            "image": self.image[:500] if self.image else "🙏",
            "category": self.category,
        }