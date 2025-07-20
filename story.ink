VAR player_dead = false
VAR days_survived = 0
VAR tributes_remaining = 24
VAR player_health = 100
VAR player_strength = 0
VAR player_stealth = 0
VAR player_knowledge = 0
VAR player_weapon = ""
VAR player_inventory = ""
VAR player_age = 0
VAR player_district = ""
VAR player_name = ""
VAR action_input = ""
VAR action_result = ""

=== intro ===
Welcome to Panem. The Capitol watches. The Districts remember.

Before we begin, let's get to know you.

What is your name?

* Enter your name
    ~ player_name = "Unknown Player"
-> ask_age

=== ask_age ===
How old are you?

* I'm 12 years old
    ~ player_age = 12
    -> ask_district
* I'm 13 years old
    ~ player_age = 13
    -> ask_district
* I'm 14 years old
    ~ player_age = 14
    -> ask_district
* I'm 15 years old
    ~ player_age = 15
    -> ask_district
* I'm 16 years old
    ~ player_age = 16
    -> ask_district
* I'm 17 years old
    ~ player_age = 17
    -> ask_district
* I'm 18 years old
    ~ player_age = 18
    -> ask_district

=== ask_district ===
Which district are you from?

* District 1 - Luxury Items
    ~ player_district = "District 1 - Luxury Items"
    -> reaping_intro
* District 2 - Masonry & Defense
    ~ player_district = "District 2 - Masonry & Defense"
    -> reaping_intro
* District 3 - Technology
    ~ player_district = "District 3 - Technology"
    -> reaping_intro
* District 4 - Fishing
    ~ player_district = "District 4 - Fishing"
    -> reaping_intro
* District 5 - Power
    ~ player_district = "District 5 - Power"
    -> reaping_intro
* District 6 - Transportation
    ~ player_district = "District 6 - Transportation"
    -> reaping_intro
* District 7 - Lumber
    ~ player_district = "District 7 - Lumber"
    -> reaping_intro
* District 8 - Textiles
    ~ player_district = "District 8 - Textiles"
    -> reaping_intro
* District 9 - Grain
    ~ player_district = "District 9 - Grain"
    -> reaping_intro
* District 10 - Livestock
    ~ player_district = "District 10 - Livestock"
    -> reaping_intro
* District 11 - Agriculture
    ~ player_district = "District 11 - Agriculture"
    -> reaping_intro
* District 12 - Coal Mining
    ~ player_district = "District 12 - Coal Mining"
    -> reaping_intro

=== reaping_intro ===
The Reaping Day begins. Crowds form. Tension rises.

You hear your name called…

Your world collapses in a moment. You are the chosen tribute.

-> mentor_scene

=== mentor_scene ===
Your mentor pulls you into a dark corner.

* Pick a med-kit
    Your mentor hands you a small medical kit. "This could save your life," she whispers. "It contains bandages, antiseptic, and painkillers. Use it wisely." You carefully tuck it into your pocket, feeling a bit more prepared for what lies ahead.
    ~ player_inventory = "Med-kit"
    -> training_start
* Pick throwing knives
    Your mentor produces a set of finely crafted throwing knives. "These are balanced perfectly," she explains. "They're small enough to hide, but deadly in the right hands. Practice with them every chance you get." You test the weight of one in your hand - it feels natural, like an extension of your arm.
    ~ player_weapon = "Throwing knives"
    -> training_start
* Pick a rope & trap kit
    Your mentor gives you a bundle containing rope, wire, and various small tools. "This is for setting traps and moving quietly," she says. "The rope can be used for climbing, binding, or even as a weapon. The wire is perfect for snares." You nod, understanding the value of stealth in the arena.
    ~ player_inventory = "Rope & trap kit"
    -> training_start

=== training_start ===
You enter the Capitol training center.

-> train_day_1

=== train_day_1 ===
Day 1 of training. Choose your activity:

* Practice with a spear
    You spend hours practicing with the spear, learning its balance and reach. The weapon feels powerful in your hands, and you quickly develop a rhythm. Your instructor shows you proper throwing techniques and close combat moves. By the end of the day, your arms are sore but you feel more confident with your chosen weapon.
    ~ player_strength += 2
    -> train_day_2
* Study edible plants
    You spend the day with a botanist, learning to identify edible plants, berries, and roots. You memorize the distinctive features of safe plants and the warning signs of poisonous ones. "This knowledge could keep you alive longer than any weapon," the botanist tells you. You carefully sketch the plants in your mind, determined to remember every detail.
    ~ player_knowledge += 2
    -> train_day_2
* Observe other tributes
    You spend the day watching the other tributes train, studying their strengths and weaknesses. You notice patterns in their movements, their preferred weapons, and how they interact with each other. Some form alliances, others work alone. You file away every detail, knowing this information could be crucial in the arena.
    ~ player_knowledge += 1
    ~ player_stealth += 1
    -> train_day_2

=== train_day_2 ===
Day 2 of training. Choose your activity:

* Practice stealth techniques
    You work with a master of stealth, learning to move silently and remain unseen. You practice camouflage techniques, how to read the environment for hiding spots, and the art of patience. "In the arena, sometimes the best weapon is invisibility," your instructor tells you. You feel more confident in your ability to avoid detection.
    ~ player_stealth += 2
    -> train_day_3
* Study survival skills
    You learn essential survival techniques - how to find clean water, build shelters, start fires, and navigate by the stars. The instructor emphasizes the importance of staying calm under pressure. "Panic kills more tributes than weapons," he says. You absorb every lesson, knowing your life may depend on it.
    ~ player_knowledge += 1
    ~ player_strength += 1
    -> train_day_3
* Practice hand-to-hand combat
    You spend the day learning close combat techniques. The training is intense and physically demanding, but you quickly improve. Your instructor teaches you how to use your opponent's strength against them and how to fight dirty when necessary. "In the arena, there are no rules," he reminds you.
    ~ player_strength += 2
    -> train_day_3

=== train_day_3 ===
Day 3 of training. Choose your weapon specialization:

* Spear
    You choose the spear as your primary weapon. It's versatile - good for both throwing and close combat. You practice until your hands are calloused and your aim is true. The spear feels like an extension of your body now.
    ~ player_weapon = "Spear"
    -> arena_intro
* Bow and arrows
    You choose the bow as your weapon. It requires skill and patience, but offers the advantage of distance. You practice until you can hit targets consistently. The bow becomes your trusted companion.
    ~ player_weapon = "Bow and arrows"
    -> arena_intro
* Throwing knives
    You choose throwing knives as your weapon. They're small, concealable, and deadly in skilled hands. You practice until your accuracy is impressive. The knives feel natural in your grip.
    ~ player_weapon = "Throwing knives"
    -> arena_intro
* Hand-to-hand combat
    You choose to rely on your fists and natural weapons. You train in various martial arts and learn pressure points and weak spots. Your body becomes your weapon.
    ~ player_weapon = "Hand-to-hand combat"
    -> arena_intro

=== arena_intro ===
The day of the Games arrives. You're taken to the arena entrance.

The countdown begins...

3... 2... 1...

The Games begin!

-> cornucopia_choice

=== cornucopia_choice ===
You find yourself on a platform overlooking the Cornucopia - a massive golden horn filled with supplies, weapons, and food. Other tributes are on platforms around you. The countdown is almost over.

What do you do?

* Run for the Cornucopia to grab supplies
    You sprint toward the Cornucopia, hoping to grab valuable supplies before other tributes can reach them. The race is on!
    ~ action_result = "You dash toward the Cornucopia, your heart pounding. Several other tributes have the same idea. It's a mad scramble for supplies!"
    -> free_roam
* Run away from the Cornucopia to avoid the initial bloodbath
    You decide to avoid the Cornucopia entirely. The initial bloodbath is always the deadliest part of the Games. You turn and run into the arena, hoping to find safety and supplies elsewhere.
    ~ action_result = "You turn away from the Cornucopia and sprint into the arena. Behind you, you hear the sounds of fighting and screams. You've avoided the initial bloodbath, but now you need to find supplies elsewhere."
    -> free_roam
* Wait and observe before making a move
    You stay on your platform for a moment, observing the chaos. You watch as tributes fight over supplies and others run in different directions. This gives you valuable information about who to avoid and where to go.
    ~ action_result = "You take a moment to observe the chaos. You see several tributes fighting over supplies at the Cornucopia, while others scatter in different directions. This information could save your life."
    -> free_roam

=== free_roam ===
You are now in the arena. The Games have truly begun.

{player_personality == "aggressive":
    Your aggressive nature makes you want to take action. You feel the urge to hunt down other tributes.
}
{player_personality == "cautious":
    Your cautious nature makes you want to observe and plan carefully before acting.
}
{player_personality == "survivalist":
    Your survival instincts kick in. You focus on finding resources and staying alive.
}
{player_personality == "strategic":
    Your strategic mind analyzes the situation. You think about long-term survival and positioning.
}

{world_event == "storm_approaching":
    Dark clouds gather overhead. A storm is approaching, which could provide cover but also danger.
}
{world_event == "cannon_fire":
    A cannon booms in the distance. Another tribute has fallen. The Games are becoming more intense.
}
{world_event == "supply_drop":
    You hear the sound of a supply drop in the distance. Other tributes will be heading there.
}
{world_event == "quiet_period":
    The arena is eerily quiet. This could be a good time to move or a sign of danger nearby.
}

Choose your next action:

* Search for water
    ~ action_input = "water"
    -> calculate_water_outcome
* Run to safety
    ~ action_input = "run"
    -> calculate_movement_outcome
* Rest and recover
    ~ action_input = "rest"
    -> calculate_rest_outcome
* Build shelter
    ~ action_input = "build"
    -> calculate_build_outcome
* Search for supplies
    ~ action_input = "search"
    -> calculate_search_outcome
* Hide and sneak
    ~ action_input = "hide"
    -> calculate_stealth_outcome
* Attack enemy
    ~ action_input = "attack"
    -> calculate_combat_outcome
* Find food
    ~ action_input = "eat"
    -> calculate_food_outcome
* Wait and observe
    ~ action_input = "wait"
    -> calculate_generic_outcome

=== calculate_water_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate success chance based on multiple factors
~ temp success_chance = 50
~ temp water_quality = 5
~ temp health_gain = 5
~ temp energy_cost = 0

// Knowledge affects success and water quality
{player_knowledge > 7:
    ~ success_chance += 25
    ~ water_quality += 8
    ~ health_gain += 10
}
{player_knowledge > 4:
    ~ success_chance += 15
    ~ water_quality += 5
    ~ health_gain += 7
}

// Agility affects access to hidden sources
{player_agility > 6:
    ~ success_chance += 20
    ~ water_quality += 6
    ~ health_gain += 8
}
{player_agility > 3:
    ~ success_chance += 10
    ~ water_quality += 3
    ~ health_gain += 5
}

// Personality affects approach and results
{player_personality == "survivalist":
    ~ success_chance += 15
    ~ water_quality += 4
    ~ health_gain += 6
}
{player_personality == "cautious":
    ~ success_chance += 10
    ~ water_quality += 3
    ~ health_gain += 4
}
{player_personality == "aggressive":
    ~ success_chance -= 5
    ~ energy_cost += 3
}

// World events affect water availability
{world_event == "storm_approaching":
    ~ success_chance += 20
    ~ water_quality += 10
    ~ health_gain += 12
}
{world_event == "supply_drop":
    ~ success_chance -= 10
    ~ energy_cost += 2
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 20)
~ success_chance += random_factor

// Determine outcome based on calculated success chance
{success_chance > 80:
    {player_knowledge > 6:
        You use your extensive knowledge to locate a natural spring that's been revealed by recent weather patterns. The water is crystal clear and pure, flowing from deep underground sources. You carefully collect it, knowing this is the best water you'll find in the arena.
        ~ player_health += 20
        ~ action_result = "You found a pristine natural spring with excellent water."
    }
    {player_agility > 5:
        Your agility allows you to climb down a steep embankment to reach a hidden pool of water. Other tributes would never find this spot. The water is fresh and clean, protected from contamination.
        ~ player_health += 18
        ~ action_result = "Your agility helped you find hidden, clean water."
    }
    {player_personality == "survivalist":
        You methodically search multiple locations, using your survival instincts to identify the best water source. You find a small stream with clear, flowing water and carefully filter it through your clothing.
        ~ player_health += 16
        ~ action_result = "Your survival instincts led you to a reliable water source."
    }
    else:
        You search thoroughly and find a small stream with clear, flowing water. The water looks safe and you drink your fill, feeling much better.
        ~ player_health += 15
        ~ action_result = "You found a good source of clean water."
    }
}
{success_chance > 60:
    {player_knowledge > 4:
        You remember that running water is usually safer than still water. You find a stream and carefully filter it through your clothing before drinking, removing debris and potential contaminants.
        ~ player_health += 12
        ~ action_result = "You found a stream and filtered the water safely."
    }
    {world_event == "storm_approaching":
        The approaching storm has revealed new water sources. You find a small pool of rainwater that's relatively clean and safe to drink.
        ~ player_health += 10
        ~ action_result = "The storm revealed a clean water source."
    }
    else:
        You search for water and find a small stream. The water looks reasonably safe, though you're careful about how much you drink.
        ~ player_health += 10
        ~ action_result = "You found water and feel refreshed."
    }
}
{success_chance > 40:
    You search for water and find a small pool. The water is murky but flowing, which reduces the risk of contamination. You drink cautiously, hoping it won't make you sick.
    ~ player_health += 7
    ~ action_result = "You found water, though it's not ideal."
}
{success_chance > 20:
    You search for water but only find a stagnant pool. The water looks questionable, but you're desperate. You take small sips, hoping for the best.
    ~ player_health += 3
    ~ temp sickness_chance = RANDOM(1, 100)
    {sickness_chance > 70:
        ~ player_health -= 5
        ~ action_result = "You found water, but it made you feel sick."
    }
    else:
        ~ action_result = "You found water, though it's poor quality."
    }
}
else:
    You search for water but find nothing. The area is dry and barren. Your search was fruitless and cost you energy.
    ~ player_energy -= 5
    ~ action_result = "You searched but found no water."
}

// Apply energy cost
~ player_energy -= energy_cost

// Update personality based on action
{player_personality == "neutral":
    ~ player_personality = "survivalist"
}

-> free_roam

=== calculate_movement_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate movement success and efficiency based on multiple factors
~ temp movement_success = 60
~ temp energy_gain = 5
~ temp stealth_bonus = 0
~ temp strength_bonus = 0
~ temp encounter_risk = 20

// Agility affects movement efficiency and speed
{player_agility > 7:
    ~ movement_success += 25
    ~ energy_gain += 8
    ~ encounter_risk -= 10
}
{player_agility > 4:
    ~ movement_success += 15
    ~ energy_gain += 5
    ~ encounter_risk -= 5
}

// Personality affects movement style and outcomes
{player_personality == "cautious":
    ~ movement_success += 15
    ~ energy_gain += 3
    ~ stealth_bonus += 2
    ~ encounter_risk -= 15
}
{player_personality == "aggressive":
    ~ movement_success += 10
    ~ energy_gain += 7
    ~ strength_bonus += 1
    ~ encounter_risk += 10
}
{player_personality == "strategic":
    ~ movement_success += 20
    ~ energy_gain += 6
    ~ encounter_risk -= 8
}
{player_personality == "survivalist":
    ~ movement_success += 12
    ~ energy_gain += 4
    ~ stealth_bonus += 1
}

// World events affect movement conditions
{world_event == "storm_approaching":
    ~ movement_success -= 10
    ~ energy_gain -= 3
    ~ encounter_risk -= 20
}
{world_event == "supply_drop":
    ~ movement_success += 15
    ~ energy_gain += 5
    ~ encounter_risk += 25
}
{world_event == "cannon_fire":
    ~ movement_success -= 5
    ~ encounter_risk += 15
}
{world_event == "quiet_period":
    ~ movement_success += 10
    ~ stealth_bonus += 1
    ~ encounter_risk -= 10
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 30)
~ movement_success += random_factor

// Determine outcome based on calculated success
{movement_success > 90:
    {player_agility > 6:
        Your exceptional agility allows you to move with incredible grace and speed through the arena. You navigate obstacles effortlessly, finding the most efficient paths. Your movements are so fluid that you cover more ground than other tributes could ever hope to achieve.
        ~ player_energy += 15
        ~ player_stealth += 1
        ~ action_result = "You moved with exceptional agility and grace."
    }
    {player_personality == "strategic":
        Your strategic mind analyzes the terrain perfectly. You choose the optimal route, avoiding dangerous areas while maximizing your progress. Every step is calculated and purposeful, putting you in the best possible position.
        ~ player_energy += 12
        ~ player_knowledge += 1
        ~ action_result = "Your strategic movement was perfectly executed."
    }
    {world_event == "supply_drop":
        You move with purpose toward the supply drop, your speed and determination putting you ahead of other tributes. You might just reach the supplies first.
        ~ player_energy += 10
        ~ action_result = "You moved quickly toward the supply drop."
    }
    else:
        You move with remarkable efficiency through the arena. Your movements are smooth and purposeful, conserving energy while making excellent progress. You feel confident in your ability to navigate this dangerous environment.
        ~ player_energy += 10
        ~ action_result = "You moved with remarkable efficiency."
    }
}
{movement_success > 70:
    {player_agility > 4:
        You move with grace and speed through the arena. Your agility makes movement feel natural and effortless, allowing you to cover good ground without exhausting yourself.
        ~ player_energy += 8
        ~ action_result = "You moved gracefully through the arena."
    }
    {player_personality == "cautious":
        You move with extreme caution, checking every shadow and listening for any sound. Your careful approach keeps you safe and allows you to observe your surroundings thoroughly.
        ~ player_energy += 3
        ~ player_stealth += 1
        ~ action_result = "You moved with extreme caution."
    }
    {player_personality == "aggressive":
        You move with purpose and speed, ready to confront any threats. Your aggressive approach might attract attention but also intimidates others who might be watching.
        ~ player_energy += 7
        ~ player_strength += 1
        ~ action_result = "You moved aggressively through the arena."
    }
    {world_event == "storm_approaching":
        You move quickly to find shelter before the storm hits. The approaching weather adds urgency to your movement, but you manage to find a good path.
        ~ player_energy += 6
        ~ action_result = "You moved quickly to find shelter from the storm."
    }
    else:
        You move carefully through the arena, staying alert for danger. Your movement is steady and controlled, conserving energy while making good progress.
        ~ player_energy += 5
        ~ action_result = "You moved safely through the arena."
    }
}
{movement_success > 50:
    You move through the arena with reasonable care. The terrain is challenging, but you make steady progress. You stay alert for danger while conserving your energy.
    ~ player_energy += 3
    ~ action_result = "You moved through the arena with care."
}
{movement_success > 30:
    You struggle to move efficiently through the arena. The terrain is difficult, and you find yourself getting tired quickly. You make some progress, but it's harder than expected.
    ~ player_energy -= 2
    ~ action_result = "You struggled to move through difficult terrain."
}
else:
    Your movement is hampered by poor conditions. Whether it's difficult terrain, exhaustion, or poor visibility, you make little progress and expend more energy than you should.
    ~ player_energy -= 5
    ~ action_result = "Your movement was hampered by poor conditions."
}

// Apply bonuses
~ player_stealth += stealth_bonus
~ player_strength += strength_bonus

// Check for random encounters based on encounter risk
~ temp encounter_roll = RANDOM(1, 100)
{encounter_roll < encounter_risk:
    ~ temp encounter_type = RANDOM(1, 3)
    {encounter_type == 1:
        As you move, you spot another tribute in the distance. They haven't seen you yet, but you need to be careful.
        ~ action_result += " You spotted another tribute."
    }
    {encounter_type == 2:
        You hear movement nearby. Something or someone is close, and you need to decide whether to investigate or avoid it.
        ~ action_result += " You heard movement nearby."
    }
    {encounter_type == 3:
        You notice signs of recent activity - footprints, disturbed vegetation, or discarded items. Other tributes have been here recently.
        ~ action_result += " You found signs of other tributes."
    }
}

// Update personality based on movement style
{player_personality == "neutral":
    {encounter_risk > 30:
        ~ player_personality = "cautious"
    }
    {energy_gain > 8:
        ~ player_personality = "aggressive"
    }
}

-> free_roam

=== calculate_rest_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate rest effectiveness based on multiple factors
~ temp rest_quality = 50
~ temp health_gain = 5
~ temp energy_gain = 30
~ temp stealth_bonus = 0
~ temp knowledge_gain = 0
~ temp discovery_chance = 10

// Stealth affects how well you can hide while resting
{player_stealth > 6:
    ~ rest_quality += 25
    ~ health_gain += 8
    ~ energy_gain += 15
    ~ stealth_bonus += 2
}
{player_stealth > 3:
    ~ rest_quality += 15
    ~ health_gain += 5
    ~ energy_gain += 10
    ~ stealth_bonus += 1
}

// Knowledge affects rest location choice
{player_knowledge > 5:
    ~ rest_quality += 20
    ~ health_gain += 6
    ~ energy_gain += 12
    ~ knowledge_gain += 1
}
{player_knowledge > 2:
    ~ rest_quality += 10
    ~ health_gain += 3
    ~ energy_gain += 8
}

// Personality affects rest approach
{player_personality == "cautious":
    ~ rest_quality += 20
    ~ health_gain += 5
    ~ energy_gain += 10
    ~ stealth_bonus += 1
}
{player_personality == "survivalist":
    ~ rest_quality += 15
    ~ health_gain += 4
    ~ energy_gain += 8
    ~ discovery_chance += 10
}
{player_personality == "aggressive":
    ~ rest_quality -= 10
    ~ health_gain -= 2
    ~ energy_gain -= 5
}

// World events affect rest conditions
{world_event == "storm_approaching":
    ~ rest_quality -= 15
    ~ health_gain -= 3
    ~ energy_gain -= 8
}
{world_event == "quiet_period":
    ~ rest_quality += 20
    ~ health_gain += 5
    ~ energy_gain += 10
    ~ stealth_bonus += 1
}
{world_event == "cannon_fire":
    ~ rest_quality -= 10
    ~ energy_gain -= 5
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 25)
~ rest_quality += random_factor

// Determine outcome based on calculated rest quality
{rest_quality > 90:
    {player_stealth > 6:
        You find an excellent hiding spot and rest in perfect safety. Your stealth skills allow you to remain completely undetected while you recover. The rest is so peaceful and restorative that you feel completely refreshed.
        ~ player_health += 20
        ~ player_energy += 40
        ~ player_stealth += 2
        ~ action_result = "You found an excellent hiding spot and rested perfectly."
    }
    {player_knowledge > 5:
        Your knowledge of the arena helps you find the perfect rest location. You choose a spot that's both safe and comfortable, with good visibility and escape routes. The rest is incredibly restorative.
        ~ player_health += 18
        ~ player_energy += 35
        ~ player_knowledge += 1
        ~ action_result = "Your knowledge helped you find the perfect rest spot."
    }
    {player_personality == "cautious":
        You take extreme care in choosing your rest location, ensuring it's well-hidden and defensible. Your cautious approach pays off with a peaceful, uninterrupted rest that fully restores you.
        ~ player_health += 16
        ~ player_energy += 32
        ~ player_stealth += 1
        ~ action_result = "Your cautious approach ensured a perfect rest."
    }
    else:
        You find an excellent spot to rest and recover. The location is safe, comfortable, and allows you to fully relax. You feel completely restored and ready to continue.
        ~ player_health += 15
        ~ player_energy += 30
        ~ action_result = "You found an excellent rest spot and feel fully restored."
    }
}
{rest_quality > 70:
    {player_stealth > 3:
        You find a good hiding spot and rest relatively safely. Your stealth skills help you remain undetected, allowing for a peaceful rest that significantly restores your energy.
        ~ player_health += 12
        ~ player_energy += 25
        ~ player_stealth += 1
        ~ action_result = "You found a good hiding spot and rested safely."
    }
    {player_knowledge > 2:
        Your knowledge helps you choose a decent rest location. You find a spot that's reasonably safe and comfortable, allowing you to recover well.
        ~ player_health += 10
        ~ player_energy += 22
        ~ action_result = "Your knowledge helped you find a good rest spot."
    }
    {player_personality == "survivalist":
        You use your survival instincts to find a suitable rest location. You choose a spot that offers both safety and comfort, making the most of your rest time.
        ~ player_health += 11
        ~ player_energy += 24
        ~ action_result = "Your survival instincts led you to a good rest spot."
    }
    else:
        You rest in a well-hidden spot. The rest is peaceful and restorative. You feel your energy returning and your mind clearing. This was exactly what you needed.
        ~ player_health += 8
        ~ player_energy += 20
        ~ action_result = "You rested and feel much better."
    }
}
{rest_quality > 50:
    You find a reasonably safe place to rest. The location isn't perfect, but it's good enough to allow you to recover some energy and health.
    ~ player_health += 6
    ~ player_energy += 15
    ~ action_result = "You found a decent place to rest."
}
{rest_quality > 30:
    You rest in a less-than-ideal location. The spot is somewhat exposed, but you're tired enough to make do. You get some rest, though not as much as you'd hoped.
    ~ player_health += 3
    ~ player_energy += 10
    ~ action_result = "You rested in a less-than-ideal spot."
}
else:
    You struggle to find a good place to rest. The area is exposed and dangerous, making it difficult to relax. You get minimal rest and remain on edge throughout.
    ~ player_health += 1
    ~ player_energy += 5
    ~ action_result = "You struggled to rest in poor conditions."
}

// Apply bonuses
~ player_stealth += stealth_bonus
~ player_knowledge += knowledge_gain

// Check for discoveries during rest
~ temp discovery_roll = RANDOM(1, 100)
{discovery_roll < discovery_chance:
    ~ temp discovery_type = RANDOM(1, 3)
    {discovery_type == 1:
        While resting, you notice movement in the distance. You've spotted other tributes without being seen yourself.
        ~ action_result += " You spotted other tributes while resting."
    }
    {discovery_type == 2:
        During your rest, you hear the sound of a supply drop in the distance. You know where to go next.
        ~ action_result += " You heard a supply drop while resting."
    }
    {discovery_type == 3:
        While resting, you notice signs of recent activity nearby - footprints, disturbed ground, or discarded items.
        ~ action_result += " You found signs of recent activity while resting."
    }
}

// Update personality based on rest approach
{player_personality == "neutral":
    {rest_quality > 70:
        ~ player_personality = "cautious"
    }
    {rest_quality < 30:
        ~ player_personality = "aggressive"
    }
}

-> free_roam

=== calculate_build_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate building effectiveness based on multiple factors
~ temp build_success = 50
~ temp shelter_quality = 3
~ temp energy_cost = 5
~ temp materials_found = 0
~ temp discovery_chance = 15

// Knowledge affects building technique and material selection
{player_knowledge > 6:
    ~ build_success += 25
    ~ shelter_quality += 4
    ~ energy_cost -= 2
    ~ materials_found += 2
}
{player_knowledge > 3:
    ~ build_success += 15
    ~ shelter_quality += 2
    ~ energy_cost -= 1
    ~ materials_found += 1
}

// Strength affects construction ability
{player_strength > 5:
    ~ build_success += 20
    ~ shelter_quality += 3
    ~ energy_cost -= 1
}
{player_strength > 2:
    ~ build_success += 10
    ~ shelter_quality += 1
}

// Personality affects building approach
{player_personality == "survivalist":
    ~ build_success += 20
    ~ shelter_quality += 3
    ~ discovery_chance += 10
}
{player_personality == "cautious":
    ~ build_success += 15
    ~ shelter_quality += 2
    ~ energy_cost += 1
}
{player_personality == "strategic":
    ~ build_success += 18
    ~ shelter_quality += 2
    ~ materials_found += 1
}
{player_personality == "aggressive":
    ~ build_success -= 10
    ~ shelter_quality -= 1
    ~ energy_cost += 3
}

// World events affect building conditions
{world_event == "storm_approaching":
    ~ build_success += 20
    ~ shelter_quality += 3
    ~ energy_cost += 2
}
{world_event == "supply_drop":
    ~ build_success -= 5
    ~ energy_cost += 1
}
{world_event == "quiet_period":
    ~ build_success += 10
    ~ energy_cost -= 1
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 30)
~ build_success += random_factor

// Generate dynamic response based on calculated factors
{build_success > 90:
    {player_knowledge > 6:
        Your extensive knowledge of construction techniques allows you to build an exceptional shelter. You carefully select the best materials and use advanced building methods to create a structure that's both sturdy and well-hidden. The shelter provides excellent protection and comfort.
        ~ player_energy -= (energy_cost - 3)
        ~ action_result = "You built an exceptional shelter using advanced techniques."
    }
    {player_strength > 5:
        Your strength allows you to construct a solid, well-built shelter. You're able to move heavy materials and create a structure that provides excellent protection. The shelter is sturdy and will serve you well.
        ~ player_energy -= (energy_cost - 2)
        ~ action_result = "Your strength allowed you to build a solid, well-constructed shelter."
    }
    {player_personality == "survivalist":
        Your survival instincts guide you to build the perfect shelter. You choose a location that's both safe and practical, using materials that provide maximum protection with minimal visibility. The shelter is expertly crafted for survival.
        ~ player_energy -= (energy_cost - 2)
        ~ action_result = "Your survival instincts led you to build the perfect shelter."
    }
    else:
        You build an excellent shelter using your skills and available materials. The structure is well-designed and provides good protection from the elements and other tributes. You feel much safer now.
        ~ player_energy -= (energy_cost - 2)
        ~ action_result = "You built an excellent shelter that provides good protection."
    }
}
{build_success > 70:
    {player_knowledge > 3:
        Your knowledge helps you build a good shelter. You choose appropriate materials and use effective construction techniques. The shelter provides decent protection and is reasonably well-hidden.
        ~ player_energy -= (energy_cost - 1)
        ~ action_result = "Your knowledge helped you build a good shelter."
    }
    {player_personality == "cautious":
        You take your time building a shelter, ensuring it's well-hidden and defensible. Your careful approach results in a solid structure that provides good protection while remaining inconspicuous.
        ~ player_energy -= energy_cost
        ~ action_result = "Your cautious approach resulted in a well-hidden, solid shelter."
    }
    else:
        You build a decent shelter using available materials. The structure provides basic protection and is better than nothing. You feel somewhat safer with this shelter.
        ~ player_energy -= energy_cost
        ~ action_result = "You built a decent shelter that provides basic protection."
    }
}
{build_success > 50:
    You construct a basic shelter. It's not perfect, but it provides some cover and protection. The structure is functional, though you know it could be better with more time or better materials.
    ~ player_energy -= energy_cost
    ~ action_result = "You built a basic shelter that provides some protection."
}
{build_success > 30:
    You attempt to build a shelter, but the results are poor. The structure is flimsy and provides minimal protection. You're exhausted from the effort, and the shelter barely qualifies as such.
    ~ player_energy -= (energy_cost + 2)
    ~ action_result = "You built a poor shelter that provides minimal protection."
}
else:
    Your attempt to build a shelter is a complete failure. You waste energy and materials on a structure that collapses almost immediately. You're left exhausted and without any meaningful shelter.
    ~ player_energy -= (energy_cost + 5)
    ~ action_result = "Your shelter building attempt was a complete failure."
}

// Apply material bonuses
{materials_found > 0:
    {materials_found == 1:
        While building, you find some additional materials that improve your shelter.
        ~ action_result += " You found additional materials while building."
    }
    {materials_found >= 2:
        You discover excellent building materials during construction, significantly improving your shelter's quality.
        ~ action_result += " You found excellent building materials."
    }
}

// Check for discoveries during building
~ temp discovery_roll = RANDOM(1, 100)
{discovery_roll < discovery_chance:
    ~ temp discovery_type = RANDOM(1, 3)
    {discovery_type == 1:
        While building, you notice movement in the distance. Other tributes are nearby.
        ~ action_result += " You spotted other tributes while building."
    }
    {discovery_type == 2:
        During construction, you hear the sound of a supply drop. You know where to find more materials.
        ~ action_result += " You heard a supply drop while building."
    }
    {discovery_type == 3:
        While working, you notice signs of recent activity - footprints, disturbed ground, or discarded items.
        ~ action_result += " You found signs of recent activity while building."
    }
}

// Update personality based on building approach
{player_personality == "neutral":
    {build_success > 70:
        ~ player_personality = "survivalist"
    }
    {build_success < 30:
        ~ player_personality = "aggressive"
    }
}

-> free_roam

=== calculate_search_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate search effectiveness based on multiple factors
~ temp search_success = 50
~ temp items_found = 0
~ temp energy_cost = 5
~ temp health_gain = 0
~ temp encounter_risk = 20
~ temp discovery_chance = 25

// Knowledge affects search efficiency and item recognition
{player_knowledge > 6:
    ~ search_success += 25
    ~ items_found += 3
    ~ energy_cost -= 2
    ~ health_gain += 5
}
{player_knowledge > 3:
    ~ search_success += 15
    ~ items_found += 2
    ~ energy_cost -= 1
    ~ health_gain += 3
}

// Agility affects search thoroughness and speed
{player_agility > 5:
    ~ search_success += 20
    ~ items_found += 2
    ~ energy_cost -= 1
    ~ encounter_risk -= 5
}
{player_agility > 2:
    ~ search_success += 10
    ~ items_found += 1
    ~ encounter_risk -= 2
}

// Personality affects search approach
{player_personality == "survivalist":
    ~ search_success += 20
    ~ items_found += 2
    ~ health_gain += 3
    ~ discovery_chance += 15
}
{player_personality == "cautious":
    ~ search_success += 15
    ~ items_found += 1
    ~ encounter_risk -= 10
    ~ energy_cost += 1
}
{player_personality == "strategic":
    ~ search_success += 18
    ~ items_found += 2
    ~ discovery_chance += 10
}
{player_personality == "aggressive":
    ~ search_success -= 5
    ~ encounter_risk += 15
    ~ energy_cost += 2
}

// World events affect search conditions
{world_event == "supply_drop":
    ~ search_success += 25
    ~ items_found += 3
    ~ encounter_risk += 20
}
{world_event == "storm_approaching":
    ~ search_success -= 10
    ~ energy_cost += 2
    ~ encounter_risk -= 15
}
{world_event == "quiet_period":
    ~ search_success += 15
    ~ encounter_risk -= 10
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 35)
~ search_success += random_factor

// Generate dynamic response based on calculated factors
{search_success > 95:
    {player_knowledge > 6:
        Your extensive knowledge allows you to conduct a thorough and highly effective search. You recognize valuable items that others might miss and find resources in unexpected places. Your search yields exceptional results.
        ~ player_health += 12
        ~ player_energy -= (energy_cost - 3)
        ~ action_result = "Your knowledge led to an exceptionally thorough search with valuable finds."
    }
    {player_agility > 5:
        Your agility allows you to search areas that other tributes can't reach. You climb, crawl, and explore thoroughly, finding items hidden in difficult-to-access locations. Your search is remarkably productive.
        ~ player_health += 10
        ~ player_energy -= (energy_cost - 2)
        ~ action_result = "Your agility allowed you to search thoroughly and find hidden items."
    }
    {player_personality == "survivalist":
        Your survival instincts guide you to search the most promising locations. You focus on areas that are most likely to contain useful resources, and your instincts prove correct. You find exactly what you need.
        ~ player_health += 11
        ~ player_energy -= (energy_cost - 2)
        ~ action_result = "Your survival instincts led you to find exactly what you needed."
    }
    else:
        You conduct an exceptionally thorough search of the area. Your methodical approach and attention to detail pay off with excellent results. You find valuable supplies and resources.
        ~ player_health += 10
        ~ player_energy -= (energy_cost - 2)
        ~ action_result = "You conducted an exceptionally thorough search with excellent results."
    }
}
{search_success > 75:
    {player_knowledge > 3:
        Your knowledge helps you search effectively. You recognize useful items and know where to look for them. Your search is productive and yields good results.
        ~ player_health += 8
        ~ player_energy -= (energy_cost - 1)
        ~ action_result = "Your knowledge helped you search effectively and find useful items."
    }
    {player_personality == "cautious":
        You search carefully and methodically, taking your time to ensure you don't miss anything important. Your thorough approach results in good finds while keeping you safe.
        ~ player_health += 7
        ~ player_energy -= energy_cost
        ~ action_result = "Your cautious, thorough search yielded good results."
    }
    else:
        You search thoroughly and find some useful items. There's a bit of food, some materials you can use, and other helpful supplies. Not a huge find, but definitely helpful.
        ~ player_health += 6
        ~ player_energy -= energy_cost
        ~ action_result = "You found some useful supplies through thorough searching."
    }
}
{search_success > 55:
    You search the area and find some items. The results are decent, though not exceptional. You gather what you can and feel somewhat better equipped.
    ~ player_health += 4
    ~ player_energy -= energy_cost
    ~ action_result = "You found some useful items through your search."
}
{search_success > 35:
    You search the area but find little of value. The search is somewhat disappointing, though you do find a few basic items that might be useful later.
    ~ player_health += 2
    ~ player_energy -= energy_cost
    ~ action_result = "Your search yielded few useful items."
}
else:
    You search the area but find almost nothing of value. The search is largely fruitless and leaves you feeling frustrated and tired. You waste energy on a search that produces minimal results.
    ~ player_energy -= (energy_cost + 2)
    ~ action_result = "Your search was largely fruitless and wasted energy."
}

// Apply item bonuses
{items_found > 0:
    {items_found >= 3:
        You discover a cache of valuable supplies that significantly improves your situation.
        ~ action_result += " You discovered a valuable cache of supplies."
    }
    {items_found == 2:
        You find several useful items that will help you survive.
        ~ action_result += " You found several useful items."
    }
    {items_found == 1:
        You find a few items that might be helpful.
        ~ action_result += " You found a few potentially useful items."
    }
}

// Check for encounters during search
~ temp encounter_roll = RANDOM(1, 100)
{encounter_roll < encounter_risk:
    ~ temp encounter_type = RANDOM(1, 3)
    {encounter_type == 1:
        While searching, you spot another tribute in the distance. They haven't seen you yet, but you need to be careful.
        ~ action_result += " You spotted another tribute while searching."
    }
    {encounter_type == 2:
        You hear movement nearby during your search. Something or someone is close, and you need to decide whether to investigate or avoid it.
        ~ action_result += " You heard movement nearby while searching."
    }
    {encounter_type == 3:
        You notice signs of recent activity - footprints, disturbed vegetation, or discarded items. Other tributes have been here recently.
        ~ action_result += " You found signs of other tributes while searching."
    }
}

// Check for discoveries during search
~ temp discovery_roll = RANDOM(1, 100)
{discovery_roll < discovery_chance:
    ~ temp discovery_type = RANDOM(1, 3)
    {discovery_type == 1:
        During your search, you discover a hidden path or area that could be useful later.
        ~ action_result += " You discovered a hidden area during your search."
    }
    {discovery_type == 2:
        While searching, you notice a good vantage point that could help you observe the arena.
        ~ action_result += " You found a good vantage point while searching."
    }
    {discovery_type == 3:
        Your search reveals information about the arena's layout that could be valuable.
        ~ action_result += " You learned about the arena's layout during your search."
    }
}

// Update personality based on search approach
{player_personality == "neutral":
    {search_success > 75:
        ~ player_personality = "survivalist"
    }
    {search_success < 35:
        ~ player_personality = "aggressive"
    }
}

-> free_roam

=== calculate_stealth_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

You sneak with expert precision. Your movements are silent and calculated. You manage to observe other tributes without being detected. Your stealth training is paying off.
~ player_stealth += 1
~ action_result = "You moved silently and avoided detection."

-> free_roam

=== calculate_combat_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate combat effectiveness based on multiple factors
~ temp combat_success = 50
~ temp strength_gain = 1
~ temp health_cost = 0
~ temp energy_cost = 5
~ temp weapon_bonus = 0
~ temp encounter_chance = 30

// Strength affects combat performance
{player_strength > 7:
    ~ combat_success += 30
    ~ strength_gain += 2
    ~ health_cost -= 3
}
{player_strength > 4:
    ~ combat_success += 20
    ~ strength_gain += 1
    ~ health_cost -= 2
}

// Weapon affects combat effectiveness
{player_weapon == "Spear":
    ~ combat_success += 15
    ~ weapon_bonus += 2
    ~ encounter_chance += 10
}
{player_weapon == "Bow and arrows":
    ~ combat_success += 20
    ~ weapon_bonus += 3
    ~ encounter_chance -= 5
}
{player_weapon == "Throwing knives":
    ~ combat_success += 18
    ~ weapon_bonus += 2
    ~ encounter_chance += 5
}
{player_weapon == "Hand-to-hand combat":
    ~ combat_success += 10
    ~ weapon_bonus += 1
    ~ encounter_chance += 15
}

// Personality affects combat approach
{player_personality == "aggressive":
    ~ combat_success += 25
    ~ strength_gain += 2
    ~ health_cost += 3
    ~ encounter_chance += 20
}
{player_personality == "strategic":
    ~ combat_success += 20
    ~ strength_gain += 1
    ~ health_cost -= 2
    ~ encounter_chance -= 5
}
{player_personality == "cautious":
    ~ combat_success -= 10
    ~ health_cost -= 5
    ~ encounter_chance -= 15
}
{player_personality == "survivalist":
    ~ combat_success += 5
    ~ health_cost -= 3
    ~ encounter_chance -= 10
}

// World events affect combat conditions
{world_event == "cannon_fire":
    ~ combat_success += 15
    ~ encounter_chance += 25
}
{world_event == "supply_drop":
    ~ combat_success += 10
    ~ encounter_chance += 20
}
{world_event == "quiet_period":
    ~ combat_success -= 5
    ~ encounter_chance -= 10
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 35)
~ combat_success += random_factor

// Determine outcome based on calculated combat success
{combat_success > 95:
    {player_strength > 7:
        Your exceptional strength and combat skills make you a formidable opponent. You practice advanced techniques with deadly precision, feeling completely confident in your ability to defend yourself. Your movements are fluid and powerful.
        ~ player_strength += 3
        ~ player_health += 5
        ~ action_result = "Your exceptional combat skills were on full display."
    }
    {player_weapon == "Bow and arrows":
        Your archery skills are exceptional. You practice with deadly accuracy, hitting targets with perfect precision. The bow feels like an extension of your body, and you're confident you could take down any threat from a distance.
        ~ player_strength += 2
        ~ player_agility += 1
        ~ action_result = "Your archery skills were exceptional."
    }
    {player_personality == "aggressive":
        Your aggressive combat training is intense and effective. You practice with raw power and determination, developing techniques that would intimidate any opponent. Your fighting spirit is unmatched.
        ~ player_strength += 3
        ~ player_health += 3
        ~ action_result = "Your aggressive combat training was intense and effective."
    }
    else:
        Your combat practice is exceptional. You feel completely in control of your abilities, confident that you can handle any threat that comes your way. Your skills have reached a new level.
        ~ player_strength += 2
        ~ player_health += 2
        ~ action_result = "Your combat practice was exceptional."
    }
}
{combat_success > 80:
    {player_strength > 4:
        Your strength and combat skills are impressive. You practice with confidence, feeling powerful and capable. Your movements are strong and controlled, showing clear improvement in your fighting abilities.
        ~ player_strength += 2
        ~ action_result = "Your combat skills were impressive."
    }
    {player_weapon != "":
        You practice with your weapon effectively. Your technique is solid and you feel more confident with your chosen weapon. The training is productive and you can see clear improvement.
        ~ player_strength += 2
        ~ action_result = "You practiced effectively with your weapon."
    }
    {player_personality == "strategic":
        You approach combat training strategically, focusing on technique and efficiency rather than brute force. Your methodical approach pays off with solid improvement in your combat abilities.
        ~ player_strength += 1
        ~ player_knowledge += 1
        ~ action_result = "Your strategic combat training was effective."
    }
    else:
        You practice your combat stance and feel more confident with your weapon. Your training is productive and you can see clear improvement in your fighting abilities.
        ~ player_strength += 2
        ~ action_result = "You practiced combat and feel more prepared."
    }
}
{combat_success > 60:
    Your combat practice is decent. You work on your techniques and feel somewhat more prepared for potential conflicts. The training is helpful, though not exceptional.
    ~ player_strength += 1
    ~ action_result = "Your combat practice was decent."
}
{combat_success > 40:
    You attempt to practice combat, but your technique is rusty. The training is somewhat helpful, but you know you need more work to be truly effective in a fight.
    ~ action_result = "Your combat practice was basic but helpful."
}
{combat_success > 20:
    Your combat practice is poor. You struggle with the techniques and don't feel much more prepared than before. The training was largely ineffective.
    ~ player_energy -= 3
    ~ action_result = "Your combat practice was largely ineffective."
}
else:
    Your attempt at combat training is a complete failure. You're exhausted and frustrated, and you feel less prepared than before you started. The training was counterproductive.
    ~ player_energy -= 5
    ~ player_health -= 2
    ~ action_result = "Your combat training was a complete failure."
}

// Apply costs and bonuses
~ player_health -= health_cost
~ player_energy -= energy_cost
~ player_strength += strength_gain

// Check for combat encounters
~ temp encounter_roll = RANDOM(1, 100)
{encounter_roll < encounter_chance:
    ~ temp encounter_type = RANDOM(1, 3)
    {encounter_type == 1:
        During your combat practice, you spot another tribute watching from a distance. They quickly disappear, but you know they've seen you.
        ~ action_result += " You were observed by another tribute."
    }
    {encounter_type == 2:
        Your combat practice attracts attention. You hear movement nearby and realize other tributes are aware of your location.
        ~ action_result += " Your practice attracted unwanted attention."
    }
    {encounter_type == 3:
        While practicing, you notice signs of recent combat in the area - disturbed ground, blood stains, or discarded weapons.
        ~ action_result += " You found signs of recent combat nearby."
    }
}

// Update personality based on combat approach
{player_personality == "neutral":
    {combat_success > 80:
        ~ player_personality = "aggressive"
    }
    {combat_success < 30:
        ~ player_personality = "cautious"
    }
}

-> free_roam

=== calculate_food_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate food finding effectiveness based on multiple factors
~ temp food_success = 50
~ temp food_quality = 3
~ temp health_gain = 5
~ temp energy_cost = 3
~ temp encounter_risk = 25
~ temp discovery_chance = 20

// Knowledge affects food identification and safety
{player_knowledge > 6:
    ~ food_success += 25
    ~ food_quality += 4
    ~ health_gain += 8
    ~ energy_cost -= 1
}
{player_knowledge > 3:
    ~ food_success += 15
    ~ food_quality += 2
    ~ health_gain += 5
}

// Agility affects food gathering ability
{player_agility > 5:
    ~ food_success += 20
    ~ food_quality += 3
    ~ health_gain += 6
    ~ encounter_risk -= 5
}
{player_agility > 2:
    ~ food_success += 10
    ~ food_quality += 1
    ~ health_gain += 3
}

// Personality affects food gathering approach
{player_personality == "survivalist":
    ~ food_success += 20
    ~ food_quality += 3
    ~ health_gain += 6
    ~ discovery_chance += 15
}
{player_personality == "cautious":
    ~ food_success += 15
    ~ food_quality += 2
    ~ encounter_risk -= 10
    ~ energy_cost += 1
}
{player_personality == "strategic":
    ~ food_success += 18
    ~ food_quality += 2
    ~ health_gain += 4
    ~ discovery_chance += 10
}
{player_personality == "aggressive":
    ~ food_success -= 5
    ~ encounter_risk += 15
    ~ energy_cost += 2
}

// World events affect food availability
{world_event == "supply_drop":
    ~ food_success += 25
    ~ food_quality += 4
    ~ health_gain += 8
    ~ encounter_risk += 20
}
{world_event == "storm_approaching":
    ~ food_success -= 10
    ~ energy_cost += 2
    ~ encounter_risk -= 15
}
{world_event == "quiet_period":
    ~ food_success += 15
    ~ encounter_risk -= 10
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 30)
~ food_success += random_factor

// Generate dynamic response based on calculated factors
{food_success > 90:
    {player_knowledge > 6:
        Your extensive knowledge of edible plants and food sources allows you to find excellent, nutritious food. You identify safe, high-quality food items that provide substantial nourishment. Your knowledge ensures you avoid anything dangerous.
        ~ player_health += 15
        ~ player_energy -= (energy_cost - 2)
        ~ action_result = "Your knowledge led you to find excellent, nutritious food."
    }
    {player_agility > 5:
        Your agility allows you to reach food sources that other tributes can't access. You climb trees, navigate difficult terrain, and gather food from hard-to-reach locations. Your efforts yield high-quality results.
        ~ player_health += 14
        ~ player_energy -= (energy_cost - 1)
        ~ action_result = "Your agility allowed you to access high-quality food sources."
    }
    {player_personality == "survivalist":
        Your survival instincts guide you to the best food sources. You know exactly where to look and what to gather, focusing on the most nutritious and safe options available. Your instincts prove invaluable.
        ~ player_health += 13
        ~ player_energy -= (energy_cost - 1)
        ~ action_result = "Your survival instincts led you to excellent food sources."
    }
    else:
        You find excellent food sources and gather a substantial amount of nutritious food. The quality is high and you feel significantly better after eating. Your food gathering efforts are highly successful.
        ~ player_health += 12
        ~ player_energy -= (energy_cost - 1)
        ~ action_result = "You found excellent food sources and gathered substantial nourishment."
    }
}
{food_success > 70:
    {player_knowledge > 3:
        Your knowledge helps you identify safe and nutritious food. You find good quality food items and avoid anything potentially dangerous. Your search is productive and yields satisfying results.
        ~ player_health += 10
        ~ player_energy -= energy_cost
        ~ action_result = "Your knowledge helped you find safe, nutritious food."
    }
    {player_personality == "cautious":
        You search carefully for food, taking your time to ensure everything you gather is safe to eat. Your cautious approach pays off with good quality food that provides solid nourishment.
        ~ player_health += 9
        ~ player_energy -= energy_cost
        ~ action_result = "Your cautious approach led to safe, good-quality food."
    }
    else:
        You find good food sources and gather a decent amount of food. The quality is acceptable and you feel better after eating. Your food gathering efforts are successful.
        ~ player_health += 8
        ~ player_energy -= energy_cost
        ~ action_result = "You found good food sources and gathered decent nourishment."
    }
}
{food_success > 50:
    You find some food and eat what you can. The quality is decent, though not exceptional. You feel somewhat better, though you could use more substantial nourishment.
    ~ player_health += 6
    ~ player_energy -= energy_cost
    ~ action_result = "You found some decent food and feel somewhat better."
}
{food_success > 30:
    You find little food, and what you do find is of poor quality. You eat what you can, but it's barely enough to take the edge off your hunger. The search was disappointing.
    ~ player_health += 3
    ~ player_energy -= energy_cost
    ~ action_result = "You found little food of poor quality."
}
else:
    Your search for food is largely unsuccessful. You find almost nothing edible, and what little you do find is barely worth the effort. You waste energy on a fruitless search.
    ~ player_energy -= (energy_cost + 2)
    ~ action_result = "Your food search was largely unsuccessful."
}

// Check for food poisoning (based on food quality)
{food_quality < 2:
    ~ temp poisoning_chance = RANDOM(1, 100)
    {poisoning_chance > 70:
        The poor quality food makes you feel sick. You should have been more careful about what you ate.
        ~ player_health -= 5
        ~ action_result += " The poor food made you feel sick."
    }
}

// Check for encounters during food gathering
~ temp encounter_roll = RANDOM(1, 100)
{encounter_roll < encounter_risk:
    ~ temp encounter_type = RANDOM(1, 3)
    {encounter_type == 1:
        While gathering food, you spot another tribute in the distance. They haven't seen you yet, but you need to be careful.
        ~ action_result += " You spotted another tribute while gathering food."
    }
    {encounter_type == 2:
        You hear movement nearby during your food search. Something or someone is close, and you need to decide whether to investigate or avoid it.
        ~ action_result += " You heard movement nearby while gathering food."
    }
    {encounter_type == 3:
        You notice signs of recent activity - footprints, disturbed vegetation, or discarded items. Other tributes have been here recently.
        ~ action_result += " You found signs of other tributes while gathering food."
    }
}

// Check for discoveries during food gathering
~ temp discovery_roll = RANDOM(1, 100)
{discovery_roll < discovery_chance:
    ~ temp discovery_type = RANDOM(1, 3)
    {discovery_type == 1:
        While gathering food, you discover a hidden grove with abundant food sources that you can return to later.
        ~ action_result += " You discovered a hidden grove with abundant food."
    }
    {discovery_type == 2:
        During your food search, you notice a good hunting area that could provide meat in the future.
        ~ action_result += " You found a good hunting area while searching for food."
    }
    {discovery_type == 3:
        Your food gathering reveals information about the arena's ecosystem that could be valuable for future survival.
        ~ action_result += " You learned about the arena's ecosystem while gathering food."
    }
}

// Update personality based on food gathering approach
{player_personality == "neutral":
    {food_success > 70:
        ~ player_personality = "survivalist"
    }
    {food_success < 30:
        ~ player_personality = "aggressive"
    }
}

-> free_roam

=== calculate_generic_outcome ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games!"
}

// Calculate observation effectiveness based on multiple factors
~ temp observation_success = 50
~ temp energy_gain = 3
~ temp knowledge_gain = 0
~ temp stealth_bonus = 0
~ temp discovery_chance = 30
~ temp encounter_risk = 10

// Knowledge affects observation quality and information gathering
{player_knowledge > 6:
    ~ observation_success += 25
    ~ energy_gain += 5
    ~ knowledge_gain += 2
    ~ discovery_chance += 20
}
{player_knowledge > 3:
    ~ observation_success += 15
    ~ energy_gain += 3
    ~ knowledge_gain += 1
    ~ discovery_chance += 10
}

// Stealth affects observation safety and effectiveness
{player_stealth > 6:
    ~ observation_success += 20
    ~ energy_gain += 4
    ~ stealth_bonus += 2
    ~ encounter_risk -= 15
}
{player_stealth > 3:
    ~ observation_success += 10
    ~ energy_gain += 2
    ~ stealth_bonus += 1
    ~ encounter_risk -= 8
}

// Personality affects observation approach
{player_personality == "cautious":
    ~ observation_success += 25
    ~ energy_gain += 3
    ~ stealth_bonus += 2
    ~ encounter_risk -= 20
    ~ discovery_chance += 15
}
{player_personality == "strategic":
    ~ observation_success += 20
    ~ energy_gain += 4
    ~ knowledge_gain += 1
    ~ discovery_chance += 20
}
{player_personality == "survivalist":
    ~ observation_success += 15
    ~ energy_gain += 2
    ~ discovery_chance += 15
}
{player_personality == "aggressive":
    ~ observation_success -= 10
    ~ encounter_risk += 15
    ~ energy_gain -= 2
}

// World events affect observation conditions
{world_event == "quiet_period":
    ~ observation_success += 25
    ~ energy_gain += 5
    ~ stealth_bonus += 1
    ~ encounter_risk -= 15
}
{world_event == "cannon_fire":
    ~ observation_success += 15
    ~ encounter_risk += 10
    ~ discovery_chance += 10
}
{world_event == "supply_drop":
    ~ observation_success += 10
    ~ encounter_risk += 20
    ~ discovery_chance += 15
}
{world_event == "storm_approaching":
    ~ observation_success -= 10
    ~ energy_gain -= 2
    ~ encounter_risk -= 10
}

// Random factor for unpredictability
~ temp random_factor = RANDOM(1, 25)
~ observation_success += random_factor

// Generate dynamic response based on calculated factors
{observation_success > 90:
    {player_knowledge > 6:
        Your extensive knowledge allows you to observe the arena with exceptional insight. You notice patterns, identify potential threats and opportunities, and gather valuable information that others would miss. Your analytical mind processes every detail.
        ~ player_energy += 12
        ~ player_knowledge += 2
        ~ action_result = "Your knowledge allowed you to observe with exceptional insight."
    }
    {player_stealth > 6:
        Your stealth skills allow you to observe the arena from perfect hiding spots. You remain completely undetected while gathering extensive information about your surroundings. Your observations are thorough and valuable.
        ~ player_energy += 10
        ~ player_stealth += 2
        ~ action_result = "Your stealth allowed you to observe thoroughly while remaining hidden."
    }
    {player_personality == "cautious":
        Your cautious nature makes you an excellent observer. You take your time, notice every detail, and gather comprehensive information about your surroundings. Your careful approach yields valuable insights.
        ~ player_energy += 11
        ~ player_stealth += 1
        ~ action_result = "Your cautious approach led to comprehensive observations."
    }
    else:
        You observe your surroundings with remarkable attention to detail. You notice patterns, identify potential threats and opportunities, and gather valuable information about the arena. Your observations are highly productive.
        ~ player_energy += 10
        ~ action_result = "You observed your surroundings with remarkable attention to detail."
    }
}
{observation_success > 70:
    {player_knowledge > 3:
        Your knowledge helps you observe effectively. You notice important details and gather useful information about your surroundings. Your observations are productive and informative.
        ~ player_energy += 8
        ~ player_knowledge += 1
        ~ action_result = "Your knowledge helped you observe effectively and gather useful information."
    }
    {player_personality == "strategic":
        You observe strategically, focusing on information that could be valuable for your survival. Your methodical approach yields good insights about the arena and potential threats.
        ~ player_energy += 7
        ~ player_knowledge += 1
        ~ action_result = "Your strategic observation yielded valuable insights."
    }
    else:
        You observe your surroundings carefully and gather useful information. You notice important details about the arena and feel more aware of your environment. Your observations are helpful.
        ~ player_energy += 6
        ~ action_result = "You observed your surroundings carefully and gathered useful information."
    }
}
{observation_success > 50:
    You wait and observe your surroundings. You gather some useful information and feel more aware of your environment. The observation is helpful, though not exceptional.
    ~ player_energy += 4
    ~ action_result = "You observed your surroundings and gathered some useful information."
}
{observation_success > 30:
    You attempt to observe your surroundings, but your attention wanders. You gather some basic information, though not as much as you'd hoped. The observation is somewhat helpful.
    ~ player_energy += 2
    ~ action_result = "You observed your surroundings with limited success."
}
else:
    You try to observe your surroundings, but you're distracted and unfocused. You gather little useful information and waste time that could have been spent more productively.
    ~ player_energy -= 1
    ~ action_result = "Your observation was unfocused and unproductive."
}

// Apply bonuses
~ player_stealth += stealth_bonus
~ player_knowledge += knowledge_gain

// Check for discoveries during observation
~ temp discovery_roll = RANDOM(1, 100)
{discovery_roll < discovery_chance:
    ~ temp discovery_type = RANDOM(1, 4)
    {discovery_type == 1:
        While observing, you spot movement in the distance. You've identified other tributes without being seen yourself.
        ~ action_result += " You spotted other tributes while observing."
    }
    {discovery_type == 2:
        During your observation, you hear the sound of a supply drop in the distance. You now know where to find supplies.
        ~ action_result += " You heard a supply drop while observing."
    }
    {discovery_type == 3:
        While observing, you notice signs of recent activity - footprints, disturbed ground, or discarded items.
        ~ action_result += " You found signs of recent activity while observing."
    }
    {discovery_type == 4:
        Your observation reveals a good vantage point or hiding spot that could be useful later.
        ~ action_result += " You discovered a useful vantage point while observing."
    }
}

// Check for encounters during observation
~ temp encounter_roll = RANDOM(1, 100)
{encounter_roll < encounter_risk:
    ~ temp encounter_type = RANDOM(1, 3)
    {encounter_type == 1:
        While observing, you notice another tribute looking in your direction. They might have spotted you.
        ~ action_result += " You were potentially spotted while observing."
    }
    {encounter_type == 2:
        You hear movement very close by during your observation. Something or someone is nearby.
        ~ action_result += " You heard movement very close by while observing."
    }
    {encounter_type == 3:
        Your observation reveals that you're not as well-hidden as you thought. You need to be more careful.
        ~ action_result += " You realized you're not as well-hidden as you thought."
    }
}

// Update personality based on observation approach
{player_personality == "neutral":
    {observation_success > 70:
        ~ player_personality = "cautious"
    }
    {observation_success < 30:
        ~ player_personality = "aggressive"
    }
}

-> free_roam