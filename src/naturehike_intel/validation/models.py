from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator


class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    @field_validator("*", mode="after")
    @classmethod
    def utc_timestamp(cls, value):
        if isinstance(value, datetime) and (
            value.utcoffset() is None or value.utcoffset().total_seconds() != 0
        ):
            raise ValueError("timestamps must be UTC")
        return value


class Source(Contract):
    source_id: str = Field(min_length=1)
    url: HttpUrl
    publisher: str
    retrieved_at_utc: datetime
    identifier: str
    tier: Literal["A", "B", "C", "D"]
    extracted_fields: list[str] = Field(min_length=1)
    confidence: Literal["high", "medium", "low"]
    access_method: Literal["manual_web_review", "manual_export", "authorized_api"]
    restriction_review: str = Field(min_length=20)
    public_use: Literal["concise_facts_only", "authorized_export"]
    limitations: list[str]
    evidence_sha256: str = Field(pattern=r"^[a-f0-9]{64}$")


class Product(Contract):
    product_id: str = Field(min_length=1)
    brand_id: str
    product_name: str
    product_variant: str
    product_url: HttpUrl
    product_category: Literal["backpacking_tent"]
    capacity_persons: Literal[2]
    season_rating: Literal["3-season", "3+-season", "4-season"] | None
    price_usd: float | None = Field(ge=0.01)
    price_type: Literal["regular", "sale", "displayed_unclassified", "unavailable"]
    price_observed_at_utc: datetime
    minimum_weight_g: float | None = Field(gt=0)
    packed_weight_g: float | None = Field(gt=0)
    weight_definition: str
    floor_area_m2: float | None = Field(gt=0)
    doors_count: int | None = Field(ge=1, le=4)
    freestanding_status: Literal["freestanding", "semi-freestanding", "non-freestanding"] | None
    footprint_included: bool | None
    source_id: str
    verification_status: Literal["verified", "partial", "unverified"]
    construction: Literal["double-wall", "single-wall"] | None
    advertised_us: bool
    backpacking_evidence: str
    availability: Literal["advertised", "out_of_stock", "unknown"]
    is_test_data: bool = False
    missing_reasons: dict[str, str]
    field_evidence: dict[str, str]
    original_price_usd: float | None = Field(default=None, gt=0)
    currency_original: Literal["USD"] = "USD"
    shipping_cost_usd: float | None = Field(default=None, ge=0)
    floor_length_cm: float | None = Field(default=None, gt=0)
    floor_width_cm: float | None = Field(default=None, gt=0)
    peak_height_cm: float | None = Field(default=None, gt=0)
    waterproof_rating_mm: float | None = Field(default=None, gt=0)
    fabric_material: str | None = None
    pole_material: str | None = None
    vendor_name: str | None = None
    listing_type: Literal["brand_owned", "retailer"] = "brand_owned"
    notes: str | None = None

    @model_validator(mode="after")
    def check_evidence_and_units(self):
        required_nullable = (
            "season_rating",
            "price_usd",
            "minimum_weight_g",
            "packed_weight_g",
            "floor_area_m2",
            "doors_count",
            "freestanding_status",
            "footprint_included",
            "construction",
        )
        for key in required_nullable:
            if getattr(self, key) is None and not self.missing_reasons.get(key):
                raise ValueError(f"missing reason for {key}")
        if self.price_usd is None and self.price_type != "unavailable":
            raise ValueError("null price must be unavailable")
        if self.price_type == "sale" and (
            self.original_price_usd is None or self.original_price_usd <= self.price_usd
        ):
            raise ValueError("sale price requires a higher verified original price")
        if (
            self.minimum_weight_g
            and self.packed_weight_g
            and self.minimum_weight_g > self.packed_weight_g
        ):
            raise ValueError("minimum weight exceeds packed weight")
        if self.verification_status == "verified":
            for key in required_nullable:
                if getattr(self, key) is not None and key not in self.field_evidence:
                    raise ValueError(f"verified field lacks evidence: {key}")
        return self


class TrendsMetadata(Contract):
    batch_id: str
    geography: Literal["US"]
    date_start: str
    date_end: str
    category: int = Field(ge=0)
    search_type: Literal["web", "image", "news", "shopping", "youtube"]
    exported_at_utc: datetime
    source_id: str
    normalization_scope: Literal["joint_batch"]
    is_test_data: bool
    terms: dict[str, str]
    semantics: dict[str, Literal["search_term", "topic"]]

    @model_validator(mode="after")
    def validate_period(self):
        from datetime import date

        if date.fromisoformat(self.date_start) > date.fromisoformat(self.date_end):
            raise ValueError("invalid Trends period")
        if set(self.terms) != set(self.semantics) or not self.terms or len(self.terms) > 5:
            raise ValueError("document 1–5 terms and their semantics")
        return self
