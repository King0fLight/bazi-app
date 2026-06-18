"""
八字排盘 - 核心引擎
使用 lunar_python 库进行四柱排盘计算
"""
from lunar_python import Solar, Lunar, EightChar

from .tables import (
    TIANGAN_INFO, DIZHI_INFO, CANG_GAN, NAYIN, TIANGAN, DIZHI,
    TIANGAN_HE, DIZHI_LIUHE, DIZHI_SANHE, DIZHI_SANHUI,
    DIZHI_LIUCHONG, DIZHI_XING, DIZHI_ZIXING, DIZHI_HAI, DIZHI_PO,
    WUXING_SHENG, WUXING_KE, TWELVE_STAGES, CHANGSHENG_START, CHANGSHENG_FORWARD
)
from .models import (
    BaziChart, BaziInput, Pillar, StemInfo, BranchInfo,
    DayunItem, ShenshaItem, WuxingCount, DizhiRelation, TianganRelation
)
from .shishen import calc_shishen, get_canggan_shishen
from .dayun import calc_dayun, _ganzhi_to_index
from .shensha import calc_shensha


def calculate_bazi(inp: BaziInput) -> BaziChart:
    """
    核心排盘函数: 输入出生信息 -> 输出完整八字排盘结果
    """
    # 1. 使用 lunar_python 计算四柱
    solar = Solar.fromYmdHms(inp.year, inp.month, inp.day, inp.hour, inp.minute, 0)
    lunar = solar.getLunar()
    ec = lunar.getEightChar()

    # 子时处理
    if inp.zi_mode == "whole" and inp.hour == 23:
        # 整子时归次日: 23:00后算第二天的子时
        solar_next = Solar.fromYmdHms(inp.year, inp.month, inp.day + 1, 0, 0, 0)
        lunar_next = solar_next.getLunar()
        ec_next = lunar_next.getEightChar()
        day_ganzhi = ec_next.getDay()
        time_ganzhi = ec.getTime()
    else:
        day_ganzhi = ec.getDay()
        time_ganzhi = ec.getTime()

    year_ganzhi = ec.getYear()
    month_ganzhi = ec.getMonth()

    # 2. 解析四柱天干地支
    year_stem, year_branch = year_ganzhi[0], year_ganzhi[1]
    month_stem, month_branch = month_ganzhi[0], month_ganzhi[1]
    day_stem, day_branch = day_ganzhi[0], day_ganzhi[1]
    hour_stem, hour_branch = time_ganzhi[0], time_ganzhi[1]

    all_stems = [year_stem, month_stem, day_stem, hour_stem]
    all_branches = [year_branch, month_branch, day_branch, hour_branch]

    # 3. 计算纳音
    year_nayin = _get_nayin(year_stem, year_branch)
    month_nayin = _get_nayin(month_stem, month_branch)
    day_nayin = _get_nayin(day_stem, day_branch)
    hour_nayin = _get_nayin(hour_stem, hour_branch)

    # 4. 计算十二长生
    year_cs = _get_changsheng(day_stem, year_branch)
    month_cs = _get_changsheng(day_stem, month_branch)
    day_cs = _get_changsheng(day_stem, day_branch)
    hour_cs = _get_changsheng(day_stem, hour_branch)

    # 5. 构建四柱对象
    def make_pillar(name, stem, branch, nayin, changsheng):
        canggan = get_canggan_shishen(day_stem, branch)
        canggan_models = [
            StemInfo(name=s["name"], element=s["element"],
                     yinyang=s["yinyang"], shishen=s["shishen"])
            for s in canggan
        ]
        return Pillar(
            name=name,
            stem=StemInfo(
                name=stem,
                element=TIANGAN_INFO[stem]["element"],
                yinyang=TIANGAN_INFO[stem]["yinyang"],
                shishen=calc_shishen(day_stem, stem) if stem != day_stem else "",
            ),
            branch=BranchInfo(
                name=branch,
                element=DIZHI_INFO[branch]["element"],
                animal=DIZHI_INFO[branch]["animal"],
                canggan=canggan_models,
            ),
            nayin=nayin,
            changsheng=changsheng,
        )

    year_pillar = make_pillar("年柱", year_stem, year_branch, year_nayin, year_cs)
    month_pillar = make_pillar("月柱", month_stem, month_branch, month_nayin, month_cs)
    day_pillar = make_pillar("日柱", day_stem, day_branch, day_nayin, day_cs)
    hour_pillar = make_pillar("时柱", hour_stem, hour_branch, hour_nayin, hour_cs)

    # 6. 日主
    day_master = StemInfo(
        name=day_stem,
        element=TIANGAN_INFO[day_stem]["element"],
        yinyang=TIANGAN_INFO[day_stem]["yinyang"],
        shishen="",
    )

    # 7. 五行统计 (天干+地支本气+藏干)
    wuxing = _count_wuxing(all_stems, all_branches)

    # 8. 大运
    dayun_start_age = _calc_dayun_start_age(
        ec, inp.year, inp.month, inp.day, inp.hour, inp.minute, gender=inp.gender
    )
    dayun_raw = calc_dayun(
        year_stem, year_branch, month_stem, month_branch,
        inp.gender, inp.year, inp.month, inp.day, dayun_start_age
    )
    dayun_list = [DayunItem(**d) for d in dayun_raw]

    # 9. 神煞
    shensha_raw = calc_shensha(
        day_stem, day_branch, year_branch, month_branch, hour_branch, all_branches
    )
    shensha_list = [ShenshaItem(**s) for s in shensha_raw]

    # 10. 地支关系检测
    dizhi_rels = _detect_dizhi_relations(all_branches)

    # 11. 天干关系检测
    tiangan_rels = _detect_tiangan_relations(all_stems)

    # 12. 空亡
    kongwang = _calc_kongwang(day_stem, day_branch)

    # 13. 生肖
    shengxiao = DIZHI_INFO[year_branch]["animal"]

    # 14. 农历日期
    lunar_date_str = f"{lunar.getYear()}年{['正','二','三','四','五','六','七','八','九','十','冬','腊'][lunar.getMonth()-1]}月{lunar.getDay()}日"

    return BaziChart(
        solar_date=f"{inp.year}年{inp.month}月{inp.day}日 {inp.hour:02d}:{inp.minute:02d}",
        lunar_date=lunar_date_str,
        gender=inp.gender,
        year_pillar=year_pillar,
        month_pillar=month_pillar,
        day_pillar=day_pillar,
        hour_pillar=hour_pillar,
        day_master=day_master,
        dayun=dayun_list,
        dayun_start_age=dayun_start_age,
        wuxing=wuxing,
        shensha=shensha_list,
        dizhi_relations=dizhi_rels,
        tiangan_relations=tiangan_rels,
        kongwang=kongwang,
        shengxiao=shengxiao,
    )


def _get_nayin(stem: str, branch: str) -> str:
    """获取纳音五行"""
    stem_idx = TIANGAN.index(stem)
    branch_idx = DIZHI.index(branch)
    gz_idx = _ganzhi_to_index(stem_idx, branch_idx)
    return NAYIN[gz_idx]


def _get_changsheng(day_stem: str, branch: str) -> str:
    """计算十二长生"""
    if day_stem not in CHANGSHENG_START:
        return ""
    start = CHANGSHENG_START[day_stem]
    forward = CHANGSHENG_FORWARD[day_stem]
    branch_idx = DIZHI.index(branch)

    if forward:
        offset = (branch_idx - start) % 12
    else:
        offset = (start - branch_idx) % 12

    return TWELVE_STAGES[offset]


def _count_wuxing(stems: list[str], branches: list[str]) -> WuxingCount:
    """统计五行力量"""
    count = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}

    # 天干每个算1
    for s in stems:
        count[TIANGAN_INFO[s]["element"]] += 1

    # 地支藏干: 本气算1, 中气算0.5, 余气算0.3
    weights = [1.0, 0.5, 0.3]
    for b in branches:
        cg = CANG_GAN.get(b, [])
        for i, s in enumerate(cg):
            w = weights[min(i, len(weights) - 1)]
            count[TIANGAN_INFO[s]["element"]] += w

    return WuxingCount(
        木=round(count["木"]),
        火=round(count["火"]),
        土=round(count["土"]),
        金=round(count["金"]),
        水=round(count["水"]),
    )


def _calc_dayun_start_age(ec, year, month, day, hour, minute, gender) -> int:
    """
    计算起运年龄
    阳男阴女顺行: 从出生日到下一个节的天数 / 3
    阴男阳女逆行: 从出生日到上一个节的天数 / 3
    1天 = 4个月, 3天 = 1年
    """
    # 简化计算: 使用lunar_python的大运功能
    lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar()
    ec = lunar.getEightChar()
    yun = ec.getYun(1 if gender == "男" else 0)  # 1=男, 0=女
    start_age = yun.getStartYear()
    start_month = yun.getStartMonth()
    start_day = yun.getStartDay()

    # 四舍五入到整数年
    total_months = start_age * 12 + start_month
    if start_day >= 15:
        total_months += 1
    return round(total_months / 12)


def _detect_dizhi_relations(branches: list[str]) -> list[DizhiRelation]:
    """检测地支之间的关系"""
    results = []
    b_set = set(branches)

    # 六合
    for b1, b2, element in DIZHI_LIUHE:
        if b1 in b_set and b2 in b_set:
            results.append(DizhiRelation(
                type="六合", branches=[b1, b2],
                detail=f"{b1}{b2}合{element}"
            ))

    # 三合 (需要三个都出现)
    for b1, b2, b3, element in DIZHI_SANHE:
        if b1 in b_set and b2 in b_set and b3 in b_set:
            results.append(DizhiRelation(
                type="三合", branches=[b1, b2, b3],
                detail=f"{b1}{b2}{b3}合{element}局"
            ))

    # 三会
    for b1, b2, b3, element in DIZHI_SANHUI:
        if b1 in b_set and b2 in b_set and b3 in b_set:
            results.append(DizhiRelation(
                type="三会", branches=[b1, b2, b3],
                detail=f"{b1}{b2}{b3}会{element}"
            ))

    # 六冲
    for b1, b2 in DIZHI_LIUCHONG:
        if b1 in b_set and b2 in b_set:
            results.append(DizhiRelation(
                type="六冲", branches=[b1, b2]
            ))

    # 相刑
    for entry in DIZHI_XING:
        b1, b2, b3, desc = entry
        if b3 is None:
            # 两两相刑
            if b1 in b_set and b2 in b_set:
                results.append(DizhiRelation(
                    type="相刑", branches=[b1, b2], detail=desc
                ))
        else:
            # 三支相刑 (至少出现两支)
            present = [b for b in [b1, b2, b3] if b in b_set]
            if len(present) >= 2:
                results.append(DizhiRelation(
                    type="相刑", branches=present, detail=desc
                ))

    # 自刑
    for b in DIZHI_ZIXING:
        if branches.count(b) >= 2:
            results.append(DizhiRelation(
                type="自刑", branches=[b, b], detail=f"{b}{b}自刑"
            ))

    # 相害
    for b1, b2 in DIZHI_HAI:
        if b1 in b_set and b2 in b_set:
            results.append(DizhiRelation(
                type="相害", branches=[b1, b2]
            ))

    # 相破
    for b1, b2 in DIZHI_PO:
        if b1 in b_set and b2 in b_set:
            results.append(DizhiRelation(
                type="相破", branches=[b1, b2]
            ))

    return results


def _detect_tiangan_relations(stems: list[str]) -> list[TianganRelation]:
    """检测天干关系"""
    results = []
    for s1, s2, element in TIANGAN_HE:
        if s1 in stems and s2 in stems:
            results.append(TianganRelation(
                type="合化", stems=[s1, s2],
                detail=f"{s1}{s2}合化{element}"
            ))
    return results


def _calc_kongwang(day_stem: str, day_branch: str) -> list[str]:
    """
    计算空亡
    日柱所在旬中缺失的两个地支就是空亡
    """
    stem_idx = TIANGAN.index(day_stem)
    branch_idx = DIZHI.index(day_branch)

    # 旬首: 天干从甲开始, 所以旬首地支 = 日支index - 日干index
    xun_start = (branch_idx - stem_idx) % 12

    # 空亡: 旬中最后两个地支 (第11和第12位, 即index+10和index+11)
    kw1 = DIZHI[(xun_start + 10) % 12]
    kw2 = DIZHI[(xun_start + 11) % 12]

    return [kw1, kw2]
