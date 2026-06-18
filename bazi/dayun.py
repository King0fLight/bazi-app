"""
八字排盘 - 大运计算
"""
from .tables import TIANGAN, DIZHI, TIANGAN_INFO, NAYIN


def calc_dayun(
    year_stem: str, year_branch: str,
    month_stem: str, month_branch: str,
    gender: str, birth_year: int, birth_month: int, birth_day: int,
    dayun_start_age: int
) -> list[dict]:
    """
    计算大运序列

    规则:
    - 阳男阴女: 大运顺行 (从月柱开始往后推)
    - 阴男阳女: 大运逆行 (从月柱开始往前推)
    - 每步大运 10 年
    """
    year_yinyang = TIANGAN_INFO[year_stem]["yinyang"]

    # 判断顺逆: 阳男阴女顺, 阴男阳女逆
    is_forward = (year_yinyang == "阳" and gender == "男") or \
                 (year_yinyang == "阴" and gender == "女")

    # 月柱在60甲子中的index
    month_stem_idx = TIANGAN.index(month_stem)
    month_branch_idx = DIZHI.index(month_branch)

    # 60甲子序列: 天干地支组合
    # month_ganzhi_index 是月柱在60甲子中的位置
    month_ganzhi_idx = _ganzhi_to_index(month_stem_idx, month_branch_idx)

    dayun_list = []
    for i in range(1, 9):  # 8步大运
        if is_forward:
            idx = (month_ganzhi_idx + i) % 60
        else:
            idx = (month_ganzhi_idx - i) % 60

        stem_idx = idx % 10
        branch_idx = idx % 12
        stem = TIANGAN[stem_idx]
        branch = DIZHI[branch_idx]
        element = TIANGAN_INFO[stem]["element"]

        start_age = dayun_start_age + (i - 1) * 10
        start_year = birth_year + start_age

        dayun_list.append({
            "stem": stem,
            "branch": branch,
            "element": element,
            "start_age": start_age,
            "start_year": start_year,
            "nayin": NAYIN[idx],
        })

    return dayun_list


def _ganzhi_to_index(stem_idx: int, branch_idx: int) -> int:
    """将天干地支index转换为60甲子index"""
    # 60甲子 = 天干(10) x 地支(12) 的最小公倍数
    for i in range(60):
        if i % 10 == stem_idx and i % 12 == branch_idx:
            return i
    return 0
