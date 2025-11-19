// app.js

const MIN_SCORE = 8;
const MAX_SCORE = 15;
const MAX_POINTS = 27;

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

function updateRow(row) {
    const scoreInput = row.querySelector(".score-input");
    const bgInput = row.querySelector(".background-input");
    const totalCell = row.querySelector(".total-score");
    const modCell = row.querySelector(".modifier");
    const costCell = row.querySelector(".point-cost");

    const baseScore = parseInt(scoreInput.value, 10);
    const backgroundBonus = parseInt(bgInput.value || "0", 10);

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
    const warningSpan = document.getElementById("warning");

    pointsUsedSpan.textContent = `Points used: ${totalPoints} / ${MAX_POINTS}`;
    pointsRemainingSpan.textContent = `Points remaining: ${MAX_POINTS - totalPoints}`;

    if (totalPoints > MAX_POINTS) {
        warningSpan.textContent = "You have spent more than 27 points!";
    } else if (totalPoints === MAX_POINTS) {
        warningSpan.textContent = "You have used all 27 points.";
    } else {
        warningSpan.textContent = "";
    }
}

function resetAll() {
    const rows = document.querySelectorAll("#point-buy-table tbody tr");
    rows.forEach(row => {
        const scoreInput = row.querySelector(".score-input");
        const bgInput = row.querySelector(".background-input");
        scoreInput.value = MIN_SCORE;
        bgInput.value = 0;
    });
    recalculateAll();
}

document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("point-buy-table");
    const resetButton = document.getElementById("reset-button");

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
            let current = parseInt(input.value || "0", 10);

            const min = parseInt(input.getAttribute("min") || "-99", 10);
            const max = parseInt(input.getAttribute("max") || "99", 10);

            if (target.classList.contains("minus")) {
                if (current > min) {
                    current -= 1;
                }
            } else if (target.classList.contains("plus")) {
                if (current < max) {
                    current += 1;
                }
            }
            input.value = current;
            recalculateAll();
        }
    });

    // Listen for manual changes in background bonuses
    const bgInputs = document.querySelectorAll(".background-input");
    bgInputs.forEach(input => {
        input.addEventListener("input", () => {
            recalculateAll();
        });
    });

    // Reset button
    resetButton.addEventListener("click", () => {
        resetAll();
    });

    // Initial computation
    recalculateAll();
});
