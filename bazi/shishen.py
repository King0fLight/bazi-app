"""
八字排盘 - 十神计算
"""
from .tables import TIANGAN_INFO, WUXING_SHENG, WUXING_KE, CANG_GAN


def _get_relation(my_element: str, other_element: str) -> str:
    """判断两个五行之间的关系"""
    if my_element == other_element:
        return "同"
    if WUXING_SHENG.get(my_element) == other_element:
        return "生"      # 我生
    if WUXING_KE.get(my_element) == other_element:
        return "克"      # 我克
    if WUXING_SHENG.get(other_element) == my_element:
        return "被生"    # 生我
    if WUXING_KE.get(other_element) == my_element:
        return "被克"    # 克我
    return "未知"


def calc_shishen(day_stem: str, other_stem: str) -> str:
    """
    计算十神关系
    day_stem: 日干 (日主)
    other_stem: 其他天干
    返回十神名称
    """
    if day_stem == other_stem:
        return "比肩"

    my_info = TIANGAN_INFO[day_stem]
    other_info = TIANGAN_INFO[other_stem]

    my_element = my_info["element"]
    other_element = other_info["element"]
    same_yinyang = my_info["yinyang"] == other_info["yinyang"]

    relation = _get_relation(my_element, other_element)

    SHISHEN_MAP = {
        ("同", True): "比肩",
        ("同", False): "劫财",
        ("生", True): "食神",
        ("生", False): "伤官",
        ("克", True): "偏财",
        ("克", False): "正财",
        ("被克", True): "七杀",
        ("被克", False): "正官",
        ("被生", True): "偏印",
        ("被生", False): "正印",
    }

    return SHISHEN_MAP.get((relation, same_yinyang), "未知")


def get_canggan_shishen(day_stem: str, branch: str) -> list[dict]:
    """获取某地支藏干的十神信息"""
    result = []
    for stem in CANG_GAN.get(branch, []):
        result.append({
            "name": stem,
            "element": TIANGAN_INFO[stem]["element"],
            "yinyang": TIANGAN_INFO[stem]["yinyang"],
            "shishen": calc_shishen(day_stem, stem),
        })
    return result
