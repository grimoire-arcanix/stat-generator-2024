// app.js

const MIN_SCORE = 8;
const MAX_SCORE = 15;
const MAX_POINTS = 27;
const MAX_BACKGROUND_POINTS = 3;

// D&D 5e point-buy cost table
const POINT_BUY_COSTS = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9
};

// Background → which abilities can receive bonuses
const BACKGROUNDS = {
    acolyte: {
        label: "Acolyte Origin (Int/Wis/Cha)",
        allowedAbilities: ["Intelligence", "Wisdom", "Charisma"]
    },
    artisan: {
        label: "Artisan Origin (Str/Dex/Int)",
        allowedAbilities: ["Strength", "Dexterity", "Intelligence"]
    },
    charlatan: {
        label: "Charlatan Origin (Dex/Con/Cha)",
        allowedAbilities: ["Dexterity", "Constitution", "Charisma"]
    },
    criminal: {
        label: "Criminal Origin (Dex/Con/Int)",
        allowedAbilities: ["Dexterity", "Constitution", "Intelligence"]
    },
    entertainer: {
        label: "Entertainer Origin (Str/Dex/Cha)",
        allowedAbilities: ["Strength", "Dexterity", "Charisma"]
    },
    farmer: {
        label: "Farmer Origin (Str/Con/Wis)",
        allowedAbilities: ["Strength", "Constitution", "Wisdom"]
    },
    guard: {
        label: "Guard Origin (Str/Int/Wis)",
        allowedAbilities: ["Strength", "Intelligence", "Wisdom"]
    },
    guide: {
        label: "Guide Origin (Dex/Con/Wis)",
        allowedAbilities: ["Dexterity", "Constitution", "Wisdom"]
    },
    hermit: {
        label: "Hermit Origin (Con/Wis/Cha)",
        allowedAbilities: ["Constitution", "Wisdom", "Charisma"]
    },
    merchant: {
        label: "Merchant Origin (Con/Int/Cha)",
        allowedAbilities: ["Constitution", "Intelligence", "Charisma"]
    },
    noble: {
        label: "Noble Origin (Str/Int/Cha)",
        allowedAbilities: ["Strength", "Intelligence", "Charisma"]
    },
    sage: {
        label: "Sage Origin (Con/Int/Wis)",
        allowedAbilities: ["Constitution", "Intelligence", "Wisdom"]
    },
    sailor: {
        label: "Sailor Origin (Str/Dex/Wis)",
        allowedAbilities: ["Strength", "Dexterity", "Wisdom"]
    },
    scribe: {
        label: "Scribe Origin (Dex/Int/Wis)",
        allowedAbilities: ["Dexterity", "Intelligence", "Wisdom"]
    },
    soldier: {
        label: "Soldier Origin (Str/Dex/Con)",
        allowedAbilities: ["Strength", "Dexterity", "Constitution"]
    },
    wayfarer: {
        label: "Wayfarer Origin (Dex/Wis/Cha)",
        allowedAbilities: ["Dexterity", "Wisdom", "Charisma"]
    }
};

function abilityModifier(score) {
    // floor((score - 10) / 2)
    return Math.floor((score - 10) / 2);
}

function pointCost(score) {
    if (!(score in POINT_BUY_COSTS)) {
        return 0;
    }
    return POINT_BUY_COSTS[score];
}

function formatModifier(mod) {
    return (mod >= 0 ? "+" : "") + mod.toString();
}

function getTotalBackgroundPoints() {
    const bgInputs = document.querySelectorAll(".background-input");
    let total = 0;
    bgInputs.forEach(input => {
        if (input.disabled) return;
        const val = parseInt(input.value || "0", 10);
        if (!isNaN(val)) {
            total += val;
        }
    });
    return total;
}

function updateRow(row) {
    const scoreInput = row.querySelector(".score-input");
    const bgInput = row.querySelector(".background-input");
    const totalCell = row.querySelector(".total-score");
    const modCell = row.querySelector(".modifier");
    const costCell = row.querySelector(".point-cost");

    const baseScore = parseInt(scoreInput.value, 10) || MIN_SCORE;

    let backgroundBonus = 0;
    if (!bgInput.disabled) {
        const rawBg = parseInt(bgInput.value || "0", 10);
        const minBg = parseInt(bgInput.getAttribute("min") || "0", 10);
        const maxBg = parseInt(bgInput.getAttribute("max") || "2", 10);
        let clampedBg = isNaN(rawBg) ? 0 : rawBg;
        clampedBg = Math.min(maxBg, Math.max(minBg, clampedBg));
        if (clampedBg !== rawBg && !isNaN(rawBg)) {
            bgInput.value = clampedBg;
        }
        backgroundBonus = clampedBg;
    } else {
        bgInput.value = 0;
    }

    const totalScore = baseScore + backgroundBonus;
    const modifier = abilityModifier(totalScore);
    const cost = pointCost(baseScore);

    totalCell.textContent = totalScore;
    modCell.textContent = formatModifier(modifier);
    costCell.textContent = cost;

    return cost;
}

function recalculateAll() {
    const rows = document.querySelectorAll("#point-buy-table tbody tr");
    let totalPoints = 0;

    rows.forEach(row => {
        totalPoints += updateRow(row);
    });

    const pointsUsedSpan = document.getElementById("points-used");
    const pointsRemainingSpan = document.getElementById("points-remaining");
    const bgPointsSpan = document.getElementById("bg-points-used");
    const warningSpan = document.getElementById("warning");

    const bgTotal = getTotalBackgroundPoints();

    if (pointsUsedSpan) {
        pointsUsedSpan.textContent = `Points used: ${totalPoints} / ${MAX_POINTS}`;
    }
    if (pointsRemainingSpan) {
        pointsRemainingSpan.textContent = `Points remaining: ${MAX_POINTS - totalPoints}`;
    }
    if (bgPointsSpan) {
        bgPointsSpan.textContent = `Background points used: ${bgTotal} / ${MAX_BACKGROUND_POINTS}`;
    }

    // Ability-point warnings
    if (totalPoints > MAX_POINTS) {
        warningSpan.textContent = "You have spent more than 27 points!";
    } else if (totalPoints === MAX_POINTS) {
        warningSpan.textContent = "You have used all 27 points.";
    } else {
        // No special background warning here; keep it simple.
        warningSpan.textContent = "";
    }
}

function resetAll() {
    const rows = document.querySelectorAll("#point-buy-table tbody tr");
    rows.forEach(row => {
        const scoreInput = row.querySelector(".score-input");
        const bgInput = row.querySelector(".background-input");
        scoreInput.value = MIN_SCORE;
        if (!bgInput.disabled) {
            bgInput.value = 0;
        } else {
            bgInput.value = 0;
        }
    });
    recalculateAll();
}

function applyBackground(backgroundId) {
    const config = BACKGROUNDS[backgroundId];
    const rows = document.querySelectorAll("#point-buy-table tbody tr");

    rows.forEach(row => {
        const abilityName = row.dataset.ability;
        const bgCell = row.querySelector(".background-score");
        const bgInput = row.querySelector(".background-input");
        const bgButtons = row.querySelectorAll(".background-btn");

        // Always reset bonuses when switching backgrounds
        bgInput.value = 0;

        if (config && config.allowedAbilities.includes(abilityName)) {
            bgInput.disabled = false;
            bgButtons.forEach(btn => {
                btn.disabled = false;
            });
            bgCell.classList.remove("background-disabled");
        } else {
            bgInput.disabled = true;
            bgButtons.forEach(btn => {
                btn.disabled = true;
            });
            bgCell.classList.add("background-disabled");
        }
    });

    recalculateAll();
}

document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("point-buy-table");
    const resetButton = document.getElementById("reset-button");
    const bgSelect = document.getElementById("background-select");

    // Apply initial background (default selected option)
    if (bgSelect) {
        applyBackground(bgSelect.value);
        bgSelect.addEventListener("change", () => {
            applyBackground(bgSelect.value);
        });
    } else {
        recalculateAll();
    }

    // Attach listeners for +/- buttons (ability scores + background)
    table.addEventListener("click", (event) => {
        const target = event.target;

        // Ability score +/- buttons
        if (target.classList.contains("score-btn")) {
            const row = target.closest("tr");
            const input = row.querySelector(".score-input");
            let current = parseInt(input.value, 10);

            if (target.classList.contains("minus")) {
                if (current > MIN_SCORE) {
                    current -= 1;
                }
            } else if (target.classList.contains("plus")) {
                if (current < MAX_SCORE) {
                    current += 1;
                }
            }
            input.value = current;
            recalculateAll();

        // Background bonus +/- buttons
        } else if (target.classList.contains("background-btn")) {
            const row = target.closest("tr");
            const input = row.querySelector(".background-input");
            if (input.disabled) {
                return;
            }

            let current = parseInt(input.value || "0", 10);
            const min = parseInt(input.getAttribute("min") || "0", 10);
            const max = parseInt(input.getAttribute("max") || "2", 10);

            const totalBefore = getTotalBackgroundPoints();

            if (target.classList.contains("minus")) {
                if (current > min) {
                    current -= 1;
                }
            } else if (target.classList.contains("plus")) {
                if (current < max && totalBefore < MAX_BACKGROUND_POINTS) {
                    // Ensure we don't exceed global max of 3
                    if (totalBefore + 1 <= MAX_BACKGROUND_POINTS) {
                        current += 1;
                    }
                }
            }

            input.value = current;
            recalculateAll();
        }
    });

    // Listen for manual changes in background bonuses (typing)
    const bgInputs = document.querySelectorAll(".background-input");
    bgInputs.forEach(input => {
        input.addEventListener("input", () => {
            if (input.disabled) {
                input.value = 0;
                return;
            }

            let val = parseInt(input.value || "0", 10);
            if (isNaN(val) || val < 0) val = 0;
            if (val > 2) val = 2;
            input.value = val;

            // Enforce global cap of 3 background points
            let total = getTotalBackgroundPoints();
            if (total > MAX_BACKGROUND_POINTS) {
                const excess = total - MAX_BACKGROUND_POINTS;
                val = Math.max(0, val - excess);
                input.value = val;
            }

            recalculateAll();
        });
    });

    // Reset button
    resetButton.addEventListener("click", () => {
        resetAll();
    });
});
