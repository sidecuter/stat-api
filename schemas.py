from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class UUID(BaseModel):
    id: str = Field(title="id", description="Unique user id", min_length=36, max_length=36, pattern=r"[a-f0-9]{8}-([a-f0-9]{4}-){3}-[a-f0-9]{8}")
    creation_date: datetime | None = Field(default=None)
    model_config = ConfigDict(from_attributes=True)


class SiteStat(BaseModel):
    uuid: str = Field(title="User-id", description="User id", min_length=36, max_length=36, pattern=r"[a-f0-9]{8}-([a-f0-9]{4}-){3}-[a-f0-9]{8}")
    endpoint: str | None = Field(title="User-path", description="Path visited by user", max_length=100, default=None, pattern=r"^\/(?!.*\/\/)([a-zA-Z-\/]+)$")
    model_config = ConfigDict(from_attributes=True)