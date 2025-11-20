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

// Background → which abilities can receive bonuses + tooltip text
const BACKGROUNDS = {
    acolyte: {
        label: "Acolyte (Int/Wis/Cha)",
        allowedAbilities: ["Intelligence", "Wisdom", "Charisma"],
        features: `Ability Scores: Intelligence, Wisdom, Charisma
Feat: Magic Initiate (Cleric)
Skill Proficiencies: Insight, Religion
Tool Proficiency: Calligrapher's Supplies
Equipment: Choose A or B: (A) Calligrapher's Supplies, Book (prayers), Holy Symbol, Parchment (10 sheets), Robe, 8 GP; or (B) 50 GP`,
        info: `You devoted yourself to service in a temple, either nestled in a town or secluded in a sacred grove. There you performed rites in honor of a god or pantheon. You served under a priest and studied religion. Thanks to your priest's instruction and your own devotion, you also learned how to channel a modicum of divine power in service to your place of worship and the people who prayed there.`
    },
    artisan: {
        label: "Artisan (Str/Dex/Int)",
        allowedAbilities: ["Strength", "Dexterity", "Intelligence"],
        features: `Ability Scores: Strength, Dexterity, Intelligence
Feat: Crafter
Skill Proficiencies: Investigation, Persuasion
Tool Proficiency: Choose one kind of Artisan's Tools
Equipment: Choose A or B: (A) Artisan's Tools (same as above), 2 Pouches, Traveler's Clothes, 32 GP; or (B) 50 GP`,
        info: `You began mopping floors and scrubbing counters in an artisan's workshop for a few coppers per day as soon as you were strong enough to carry a bucket. When you were old enough to apprentice, you learned to create basic crafts of your own, as well as how to sweet-talk the occasional demanding customer. Your trade has also given you a keen eye for detail.`
    },
    charlatan: {
        label: "Charlatan (Dex/Con/Cha)",
        allowedAbilities: ["Dexterity", "Constitution", "Charisma"],
        features: `Ability Scores: Dexterity, Constitution, Charisma
Feat: Skilled
Skill Proficiencies: Deception, Sleight of Hand
Tool Proficiency: Forgery Kit
Equipment: Choose A or B: (A) Forgery Kit, Costume, Fine Clothes, 15 GP; or (B) 50 GP`,
        info: `Once you were old enough to order an ale, you soon had a favorite stool in every tavern within ten miles of where you were born. As you traveled the circuit from public house to watering hole, you learned to prey on unfortunates who were in the market for a comforting lie or two—perhaps a sham potion or forged ancestry records.`
    },
    criminal: {
        label: "Criminal (Dex/Con/Int)",
        allowedAbilities: ["Dexterity", "Constitution", "Intelligence"],
        features: `Ability Scores: Dexterity, Constitution, Intelligence
Feat: Alert
Skill Proficiencies: Sleight of Hand, Stealth
Tool Proficiency: Thieves' Tools
Equipment: Choose A or B: (A) 2 Daggers, Thieves' Tools, Crowbar, 2 Pouches, Traveler's Clothes, 16 GP; or (B) 50 GP`,
        info: `You eked out a living in dark alleyways, cutting purses or burgling shops. Perhaps you were part of a small gang of like-minded wrongdoers who looked out for each other. Or maybe you were a lone wolf, fending for yourself against the local thieves' guild and more fearsome lawbreakers.`
    },
    entertainer: {
        label: "Entertainer (Str/Dex/Cha)",
        allowedAbilities: ["Strength", "Dexterity", "Charisma"],
        features: `Ability Scores: Strength, Dexterity, Charisma
Feat: Musician
Skill Proficiencies: Acrobatics, Performance
Tool Proficiency: Choose one kind of Musical Instrument
Equipment: Choose A or B: (A) Musical Instrument (same as above), 2 Costumes, Mirror, Perfume, Traveler's Clothes, 11 GP; or (B) 50 GP`,
        info: `You spent much of your youth following roving fairs and carnivals, performing odd jobs for musicians and acrobats in exchange for lessons. You may have learned how to walk a tightrope, how to play a lute in a distinct style, or how to recite poetry with impeccable diction. To this day, you thrive on applause and long for the stage.`
    },
    farmer: {
        label: "Farmer (Str/Con/Wis)",
        allowedAbilities: ["Strength", "Constitution", "Wisdom"],
        features: `Ability Scores: Strength, Constitution, Wisdom
Feat: Tough
Skill Proficiencies: Animal Handling, Nature
Tool Proficiency: Carpenter's Tools
Equipment: Choose A or B: (A) Sickle, Carpenter's Tools, Healer's Kit, Iron Pot, Shovel, 30 GP; or (B) 50 GP`,
        info: `You grew up close to the land. Years tending animals and cultivating the earth rewarded you with patience and good health. You have a keen appreciation for nature's bounty alongside a healthy respect for nature's wrath.`
    },
    guard: {
        label: "Guard (Str/Int/Wis)",
        allowedAbilities: ["Strength", "Intelligence", "Wisdom"],
        features: `Ability Scores: Strength, Intelligence, Wisdom
Feat: Alert
Skill Proficiencies: Athletics, Perception
Tool Proficiency: Choose one kind of Gaming Set
Equipment: Choose A or B: (A) Spear, Light Crossbow, 20 Bolts, Gaming Set (same as above), Hooded Lantern, Manacles, Quiver, Traveler's Clothes, 12 GP; or (B) 50 GP`,
        info: `Your feet ache when you remember the countless hours you spent at your post in the tower. You were trained to keep one eye looking outside the wall, watching for marauders sweeping from the nearby forest, and your other eye looking inside the wall, searching for cutpurses and troublemakers.`
    },
    guide: {
        label: "Guide (Dex/Con/Wis)",
        allowedAbilities: ["Dexterity", "Constitution", "Wisdom"],
        features: `Ability Scores: Dexterity, Constitution, Wisdom
Feat: Magic Initiate (Druid)
Skill Proficiencies: Stealth, Survival
Tool Proficiency: Cartographer's Tools
Equipment: Choose A or B: (A) Shortbow, 20 Arrows, Cartographer's Tools, Bedroll, Quiver, Tent, Traveler's Clothes, 3 GP; or (B) 50 GP`,
        info: `You came of age outdoors, far from settled lands. Your home was anywhere you chose to spread your bedroll. There are wonders in the wilderness—strange monsters, pristine forests and streams, overgrown ruins of great halls once trod by giants—and you learned to fend for yourself as you explored them. From time to time, you guided friendly nature priests who instructed you in the fundamentals of channeling the magic of the wild.`
    },
    hermit: {
        label: "Hermit (Con/Wis/Cha)",
        allowedAbilities: ["Constitution", "Wisdom", "Charisma"],
        features: `Ability Scores: Constitution, Wisdom, Charisma
Feat: Healer
Skill Proficiencies: Medicine, Religion
Tool Proficiency: Herbalism Kit
Equipment: Choose A or B: (A) Quarterstaff, Herbalism Kit, Bedroll, Book (philosophy), Lamp, Oil (3 flasks), Traveler's Clothes, 16 GP; or (B) 50 GP`,
        info: `You spent your early years secluded in a hut or monastery located well beyond the outskirts of the nearest settlement. In those days, your only companions were the creatures of the forest and those who would occasionally visit to bring news of the outside world and supplies. The solitude allowed you to spend many hours pondering the mysteries of creation.`
    },
    merchant: {
        label: "Merchant (Con/Int/Cha)",
        allowedAbilities: ["Constitution", "Intelligence", "Charisma"],
        features: `Ability Scores: Constitution, Intelligence, Charisma
Feat: Lucky
Skill Proficiencies: Animal Handling, Persuasion
Tool Proficiency: Navigator's Tools
Equipment: Choose A or B: (A) Navigator's Tools, 2 Pouches, Traveler's Clothes, 22 GP; or (B) 50 GP`,
        info: `You were apprenticed to a trader, caravan master, or shopkeeper, learning the fundamentals of commerce. You traveled broadly, and you earned a living by buying and selling the raw materials artisans need to practice their craft or finished works from such crafters. You might have transported goods from one place to another (by ship, wagon, or caravan) or bought them from traveling traders and sold them in your own shop.`
    },
    noble: {
        label: "Noble (Str/Int/Cha)",
        allowedAbilities: ["Strength", "Intelligence", "Charisma"],
        features: `Ability Scores: Strength, Intelligence, Charisma
Feat: Skilled
Skill Proficiencies: History, Persuasion
Tool Proficiency: Choose one kind of Gaming Set
Equipment: Choose A or B: (A) Gaming Set (same as above), Fine Clothes, Perfume, 29 GP; or (B) 50 GP`,
        info: `You were raised in a castle, surrounded by wealth, power, and privilege. Your family of minor aristocrats ensured that you received a first-class education, some of which you appreciated and some of which you resented. Your time in the castle, especially the many hours you spent observing your family at court, also taught you a great deal about leadership.`
    },
    sage: {
        label: "Sage (Con/Int/Wis)",
        allowedAbilities: ["Constitution", "Intelligence", "Wisdom"],
        features: `Ability Scores: Constitution, Intelligence, Wisdom
Feat: Magic Initiate (Wizard)
Skill Proficiencies: Arcana, History
Tool Proficiency: Calligrapher's Supplies
Equipment: Choose A or B: (A) Quarterstaff, Calligrapher's Supplies, Book (history), Parchment (8 sheets), Robe, 8 GP; or (B) 50 GP`,
        info: `You spent your formative years traveling between manors and monasteries, performing various odd jobs and services in exchange for access to their libraries. You whiled away many a long evening studying books and scrolls, learning the lore of the multiverse—even the rudiments of magic—and your mind yearns for more.`
    },
    sailor: {
        label: "Sailor (Str/Dex/Wis)",
        allowedAbilities: ["Strength", "Dexterity", "Wisdom"],
        features: `Ability Scores: Strength, Dexterity, Wisdom
Feat: Tavern Brawler
Skill Proficiencies: Acrobatics, Perception
Tool Proficiency: Navigator's Tools
Equipment: Choose A or B: (A) Dagger, Navigator's Tools, Rope, Traveler's Clothes, 20 GP; or (B) 50 GP`,
        info: `You lived as a seafarer, wind at your back and decks swaying beneath your feet. You've perched on barstools in more ports of call than you can remember, faced mighty storms, and swapped stories with folk who live beneath the waves.`
    },
    scribe: {
        label: "Scribe (Dex/Int/Wis)",
        allowedAbilities: ["Dexterity", "Intelligence", "Wisdom"],
        features: `Ability Scores: Dexterity, Intelligence, Wisdom
Feat: Skilled
Skill Proficiencies: Investigation, Perception
Tool Proficiency: Calligrapher's Supplies
Equipment: Choose A or B: (A) Calligrapher's Supplies, Fine Clothes, Lamp, Oil (3 flasks), Parchment (12 sheets), 23 GP; or (B) 50 GP`,
        info: `You spent formative years in a scriptorium, a monastery dedicated to the preservation of knowledge, or a government agency, where you learned to write with a clear hand and produce finely written texts. Perhaps you scribed government documents or copied tomes of literature. You might have some skill as a writer of poetry, narrative, or scholarly research. Above all, you have a careful attention to detail, helping you avoid introducing mistakes to the documents you copy and create.`
    },
    soldier: {
        label: "Soldier (Str/Dex/Con)",
        allowedAbilities: ["Strength", "Dexterity", "Constitution"],
        features: `Ability Scores: Strength, Dexterity, Constitution
Feat: Savage Attacker
Skill Proficiencies: Athletics, Intimidation
Tool Proficiency: Choose one kind of Gaming Set
Equipment: Choose A or B: (A) Spear, Shortbow, 20 Arrows, Gaming Set (same as above), Healer's Kit, Quiver, Traveler's Clothes, 14 GP; or (B) 50 GP`,
        info: `You began training for war as soon as you reached adulthood and carry precious few memories of life before you took up arms. Battle is in your blood. Sometimes you catch yourself reflexively performing the basic fighting exercises you learned first. Eventually, you put that training to use on the battlefield, protecting the realm by waging war.`
    },
    wayfarer: {
        label: "Wayfarer (Dex/Wis/Cha)",
        allowedAbilities: ["Dexterity", "Wisdom", "Charisma"],
        features: `Ability Scores: Dexterity, Wisdom, Charisma
Feat: Lucky
Skill Proficiencies: Insight, Stealth
Tool Proficiency: Thieves' Tools
Equipment: Choose A or B: (A) 2 Daggers, Thieves' Tools, Gaming Set (any), Bedroll, 2 Pouches, Traveler's Clothes, 16 GP; or (B) 50 GP`,
        info: `You grew up on the streets surrounded by similarly ill-fated castoffs, a few of them friends and a few of them rivals. You slept where you could and did odd jobs for food. At times, when the hunger became unbearable, you resorted to theft. Still, you never lost your pride and never abandoned hope. Fate is not yet finished with you.`
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

function applyBackground(backgroundId) {
    const config = BACKGROUNDS[backgroundId];
    const rows = document.querySelectorAll("#point-buy-table tbody tr");
    const featuresEl = document.getElementById("background-features-text");
    const infoEl = document.getElementById("background-info-text");

    rows.forEach(row => {
        const abilityName = row.dataset.ability;
        const bgCell = row.querySelector(".background-score");
        const bgInput = row.querySelector(".background-input");
        const bgButtons = row.querySelectorAll(".background-btn");

        // Reset bonus on change
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

    // Update tooltip content
    if (featuresEl && infoEl) {
        if (config) {
            featuresEl.textContent = config.features && config.features.trim()
                ? config.features
                : "Background feature details not added yet.";
            infoEl.textContent = config.info && config.info.trim()
                ? config.info
                : "";
        } else {
            featuresEl.textContent = "";
            infoEl.textContent = "";
        }
    }

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
