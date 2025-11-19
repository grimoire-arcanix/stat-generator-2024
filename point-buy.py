# point_buy.py

from dataclasses import dataclass
from typing import Dict, List

MIN_SCORE = 8
MAX_SCORE = 15
MAX_POINTS = 27

# D&D 5e standard point-buy costs
POINT_BUY_COSTS: Dict[int, int] = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
}

ABILITIES: List[str] = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma",
]

def ability_modifier(score: int) -> int:
    """
    D&D 5e ability modifier = floor((score - 10) / 2)
    """
    return (score - 10) // 2

def point_cost(score: int) -> int:
    """
    Get the point-buy cost for a given base ability score.
    Score must be between 8 and 15.
    """
    if score not in POINT_BUY_COSTS:
        raise ValueError(f"Score must be between {MIN_SCORE} and {MAX_SCORE}.")
    return POINT_BUY_COSTS[score]

@dataclass
class AbilityLine:
    name: str
    base_score: int = 8
    background_bonus: int = 0

    @property
    def total_score(self) -> int:
        return self.base_score + self.background_bonus

    @property
    def modifier(self) -> int:
        return ability_modifier(self.total_score)

    @property
    def cost(self) -> int:
        return point_cost(self.base_score)


def total_points_used(abilities: List[AbilityLine]) -> int:
    return sum(a.cost for a in abilities)


if __name__ == "__main__":
    # Example: all 8s
    ability_lines = [AbilityLine(name=a) for a in ABILITIES]
    for a in ability_lines:
        print(f"{a.name}: base={a.base_score}, bonus={a.background_bonus}, "
              f"total={a.total_score}, mod={a.modifier}, cost={a.cost}")
    print("Points used:", total_points_used(ability_lines), "/", MAX_POINTS)
