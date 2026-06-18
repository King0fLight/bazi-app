"""
八字排盘 - 数据模型
"""
from pydantic import BaseModel
from typing import Optional


class BaziInput(BaseModel):
    """排盘输入"""
    year: int           # 公历年 (1900-2100)
    month: int          # 月 (1-12)
    day: int            # 日 (1-31)
    hour: int           # 时 (0-23)
    minute: int = 0     # 分 (0-59)
    gender: str = "男"   # 男/女
    zi_mode: str = "split"  # "split"=早晚子时, "whole"=整子时归次日


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
    canggan: list[StemInfo] = []  # 藏干(含十神)


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
    dayun: list[DayunItem] = []
    dayun_start_age: int = 0

    # 五行统计
    wuxing: WuxingCount = WuxingCount()

    # 神煞
    shensha: list[ShenshaItem] = []

    # 地支关系
    dizhi_relations: list[DizhiRelation] = []

    # 天干关系
    tiangan_relations: list[TianganRelation] = []

    # 空亡
    kongwang: list[str] = []

    # 生肖
    shengxiao: str = ""
