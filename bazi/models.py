"""
八字排盘 - 数据模型
"""
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class BaziInput(BaseModel):
    """排盘输入"""
    year: int = Field(..., ge=1900, le=2100)      # 公历年
    month: int = Field(..., ge=1, le=12)          # 月
    day: int = Field(..., ge=1, le=31)            # 日
    hour: int = Field(..., ge=0, le=23)           # 时
    minute: int = Field(0, ge=0, le=59)           # 分
    gender: Literal["男", "女"] = "男"
    zi_mode: Literal["split", "whole"] = "split"  # split=早晚子时, whole=整子时归次日

    @model_validator(mode="after")
    def validate_solar_date(self):
        """校验公历年月日组合真实存在。"""
        try:
            date(self.year, self.month, self.day)
        except ValueError as exc:
            raise ValueError("出生日期不是有效的公历日期") from exc
        return self


class StemInfo(BaseModel):
    """天干信息"""
    name: str           # 甲乙丙丁...
    element: str        # 五行
    yinyang: str        # 阴阳
    shishen: str = ""   # 十神 (日柱天干为空)


class BranchInfo(BaseModel):
    """地支信息"""
    name: str           # 子丑寅卯...
    element: str        # 五行
    animal: str         # 生肖
    canggan: list[StemInfo] = Field(default_factory=list)  # 藏干(含十神)


class Pillar(BaseModel):
    """单柱"""
    name: str           # "年柱"/"月柱"/"日柱"/"时柱"
    stem: StemInfo
    branch: BranchInfo
    nayin: str = ""     # 纳音
    changsheng: str = ""  # 十二长生


class DayunItem(BaseModel):
    """大运条目"""
    stem: str
    branch: str
    element: str
    start_age: int      # 起运年龄
    start_year: int     # 起运年份
    nayin: str = ""


class ShenshaItem(BaseModel):
    """神煞"""
    name: str           # 神煞名称
    type: str           # "吉"/"凶"/"中性"
    pillar: str = ""    # 出现在哪柱


class WuxingCount(BaseModel):
    """五行统计"""
    木: int = 0
    火: int = 0
    土: int = 0
    金: int = 0
    水: int = 0


class DizhiRelation(BaseModel):
    """地支关系"""
    type: str           # 六合/三合/六冲/相刑/相害/相破
    branches: list[str]
    detail: str = ""    # 补充说明 (如合化五行)


class TianganRelation(BaseModel):
    """天干关系"""
    type: str           # 合化
    stems: list[str]
    detail: str = ""


class BaziChart(BaseModel):
    """完整八字排盘结果"""
    # 基本信息
    solar_date: str         # 公历日期
    lunar_date: str         # 农历日期
    gender: str

    # 四柱
    year_pillar: Pillar
    month_pillar: Pillar
    day_pillar: Pillar
    hour_pillar: Pillar

    # 日主
    day_master: StemInfo

    # 大运
    dayun: list[DayunItem] = Field(default_factory=list)
    dayun_start_age: int = 0

    # 五行统计
    wuxing: WuxingCount = Field(default_factory=WuxingCount)

    # 神煞
    shensha: list[ShenshaItem] = Field(default_factory=list)

    # 地支关系
    dizhi_relations: list[DizhiRelation] = Field(default_factory=list)

    # 天干关系
    tiangan_relations: list[TianganRelation] = Field(default_factory=list)

    # 空亡
    kongwang: list[str] = Field(default_factory=list)

    # 生肖
    shengxiao: str = ""
