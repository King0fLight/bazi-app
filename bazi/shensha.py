"""
八字排盘 - 神煞计算
"""
from .tables import (
    TIANYI_GUIREN, WENCHANG, YIMA, TAOHUA, HUAGAI,
    YANGREN, LUSHEN, TIANDE, YUEDE, TIANGAN_INFO, DIZHI, TIANGAN
)


def calc_shensha(
    day_stem: str, day_branch: str,
    year_branch: str, month_branch: str, hour_branch: str,
    all_branches: list[str]
) -> list[dict]:
    """
    计算常见神煞
    返回: [{name, type, pillar}]
    """
    results = []
    all_branch_set = set(all_branches)

    # ---- 以日干查 ----

    # 天乙贵人
    for gui_branch in TIANYI_GUIREN.get(day_stem, []):
        if gui_branch in all_branch_set:
            results.append({
                "name": "天乙贵人",
                "type": "吉",
                "pillar": _find_pillar(gui_branch, all_branches),
            })

    # 文昌
    wc = WENCHANG.get(day_stem)
    if wc and wc in all_branch_set:
        results.append({
            "name": "文昌",
            "type": "吉",
            "pillar": _find_pillar(wc, all_branches),
        })

    # 羊刃
    yr = YANGREN.get(day_stem)
    if yr and yr in all_branch_set:
        results.append({
            "name": "羊刃",
            "type": "凶",
            "pillar": _find_pillar(yr, all_branches),
        })

    # 禄神
    ls = LUSHEN.get(day_stem)
    if ls and ls in all_branch_set:
        results.append({
            "name": "禄神",
            "type": "吉",
            "pillar": _find_pillar(ls, all_branches),
        })

    # ---- 以日支/年支查 ----

    for ref_branch, label in [(day_branch, "日支"), (year_branch, "年支")]:
        # 驿马
        ym = YIMA.get(ref_branch)
        if ym and ym in all_branch_set:
            name = "驿马"
            if not any(r["name"] == name for r in results):
                results.append({
                    "name": name,
                    "type": "中性",
                    "pillar": _find_pillar(ym, all_branches),
                })

        # 桃花
        th = TAOHUA.get(ref_branch)
        if th and th in all_branch_set:
            name = "桃花"
            if not any(r["name"] == name for r in results):
                results.append({
                    "name": name,
                    "type": "中性",
                    "pillar": _find_pillar(th, all_branches),
                })

        # 华盖
        hg = HUAGAI.get(ref_branch)
        if hg and hg in all_branch_set:
            name = "华盖"
            if not any(r["name"] == name for r in results):
                results.append({
                    "name": name,
                    "type": "中性",
                    "pillar": _find_pillar(hg, all_branches),
                })

    # ---- 以月支查 ----

    # 天德
    td = TIANDE.get(month_branch)
    if td:
        if td in all_branch_set or td in [d["name"] for d in [
            {"name": s} for s in [day_stem]  # 天德可能是天干
        ]]:
            results.append({
                "name": "天德",
                "type": "吉",
                "pillar": "",
            })

    # 月德
    yd = YUEDE.get(month_branch)
    if yd and (yd in all_branch_set or yd == day_stem):
        results.append({
            "name": "月德",
            "type": "吉",
            "pillar": "",
        })

    return results


def _find_pillar(branch: str, all_branches: list[str]) -> str:
    """查找地支出现在哪一柱"""
    pillar_names = ["年柱", "月柱", "日柱", "时柱"]
    for i, b in enumerate(all_branches):
        if b == branch and i < len(pillar_names):
            return pillar_names[i]
    return ""
