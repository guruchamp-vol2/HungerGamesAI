-> intro

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
VAR gpt_response = ""
VAR action_input = ""

// Enemy and threat tracking
VAR nearby_enemies = 0
VAR enemy_distance = 100
VAR enemy_weapon = ""
VAR enemy_strength = 0
VAR enemy_health = 100
VAR enemy_aggressive = false
VAR enemy_aware = false

// Environmental conditions
VAR weather = "clear"
VAR time_of_day = "day"
VAR terrain_type = "forest"
VAR visibility = 100
VAR noise_level = 0
VAR food_available = 0
VAR water_available = 0
VAR shelter_quality = 0

// Player state tracking
VAR player_energy = 100
VAR player_hunger = 0
VAR player_thirst = 0
VAR player_injuries = 0
VAR player_equipment_condition = 100
VAR player_morale = 100

// Combat and survival stats
VAR combat_advantage = 0
VAR escape_chance = 100
VAR detection_risk = 0
VAR resource_abundance = 0

VAR movement_type = ""
VAR action_result = ""

VAR water_risk = 0
VAR movement_risk = 0
VAR rest_risk = 0
VAR build_risk = 0
VAR search_risk = 0
VAR stealth_risk = 0
VAR combat_risk = 0
VAR food_risk = 0
VAR generic_risk = 0
VAR risk_factor = 0
VAR success_chance = 0
VAR outcome_quality = 0
VAR action_lower = ""
VAR sponsor_points = 0
VAR name = ""
VAR district = ""
VAR age = 0
VAR health = 100
VAR weapon = ""
VAR inventory = ""


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
Day 2 of training. Choose again:

* Climb ropes and trees
    You spend the day climbing ropes, scaling walls, and practicing tree climbing techniques. Your instructor teaches you how to move silently through branches and how to use height to your advantage. "In the arena, the high ground can mean the difference between life and death," she says. You practice until your hands are calloused and your movements become fluid.
    ~ player_stealth += 2
    -> interview
* Learn to set traps
    You learn various trap-making techniques - snares, deadfalls, and pit traps. Your instructor shows you how to camouflage them and where to place them strategically. "Traps can eliminate threats without direct confrontation," he explains. You practice setting and disarming traps until you can do it quickly and quietly.
    ~ player_knowledge += 1
    ~ player_stealth += 1
    -> interview
* Hand-to-hand combat
    You spend hours learning hand-to-hand combat techniques - punches, kicks, blocks, and throws. Your instructor emphasizes efficiency and using your opponent's strength against them. "In the arena, you'll need to fight dirty to survive," he says. You practice until your muscles ache and your reflexes become sharper.
    ~ player_strength += 2
    -> interview

=== interview ===
Your private interview with the Gamemakers begins.

What is your weapon specialty?

* Spear fighting
    ~ player_weapon = "Spear"
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Archery
    ~ player_weapon = "Bow and arrows"
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Knife throwing
    ~ player_weapon = "Throwing knives"
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Hand-to-hand combat
    ~ player_weapon = "Hand-to-hand combat"
    They assign you a training score you hope will win sponsors…
    -> training_score_scene

=== training_score_scene ===
The Gamemakers confer in hushed tones. Your heart pounds as you wait for your score.

Your training score is: 7

The audience murmurs appreciatively. A solid score that should draw some sponsor interest.

* Continue to the platform
    -> platform_start

=== platform_start ===
You stand on the tribute platform. 60 seconds until start.

* Stay still and wait
    -> cornucopia_choice
* Step off the platform
    You stepped off early and triggered a land-mine. You are dead.
    ~ player_dead = true
    -> END

=== cornucopia_choice ===
The horn sounds.

* Run for the Cornucopia to grab supplies
    The horn blares and chaos erupts. You sprint toward the Cornucopia, dodging between other tributes. You see several fights break out around you as tributes battle for the best supplies. You manage to grab a backpack and quickly retreat, avoiding the bloodbath. Inside the backpack, you find bread, a knife, and a water bottle. Not much, but it's a start.
    ~ player_inventory = "Backpack with supplies"
    -> arena_intro
* Sprint into the woods
    The horn sounds and you immediately turn and run toward the forest. Behind you, you hear screams and the sounds of fighting as tributes battle over the supplies at the Cornucopia. You don't look back, focusing only on putting distance between yourself and the bloodbath. The trees provide cover as you disappear into the wilderness.
    ~ player_stealth += 1
    -> arena_intro

=== arena_intro ===
You are now inside the arena. The Games have begun.

-> free_roam

=== free_roam ===
# free_roam
{check_death()}
{check_win()}

You are in the arena. Day {days_survived + 1}. {tributes_remaining} tributes remain.

The arena stretches before you. You can move freely and take actions to survive.

* Enter free roam mode
    -> free_roam_loop

=== free_roam_loop ===
# free_roam
{check_death()}
{check_win()}

{action_input != "":
    - "water" or "river" or "stream" or "lake":
        -> calculate_water_outcome
    - "run" or "sprint" or "dash":
        ~ movement_type = "run"
        -> calculate_movement_outcome
    - "jump" or "leap" or "climb":
        ~ movement_type = "jump"
        -> calculate_movement_outcome
    - "walk" or "move" or "go":
        ~ movement_type = "walk"
        -> calculate_movement_outcome
    - "rest" or "sleep" or "sit":
        -> calculate_rest_outcome
    - "build" or "make" or "create":
        -> calculate_build_outcome
    - "search" or "look" or "explore":
        -> calculate_search_outcome
    - "hide" or "sneak" or "stealth":
        -> calculate_stealth_outcome
    - "attack" or "fight" or "kill":
        -> calculate_combat_outcome
    - "eat" or "food" or "drink":
        -> calculate_food_outcome
    - else:
        -> calculate_generic_outcome
}

You are in free roam mode. Type your actions in the input box below.

* Continue your journey
    -> free_roam_loop

=== function check_death ===
{player_dead:
    ~ return "You are dead. The Games are over for you."
}
~ return ""

=== function check_win ===
{tributes_remaining <= 1:
    ~ return "Congratulations! You are the last tribute standing! You have won the Hunger Games! The Capitol erupts in celebration as you are crowned the victor. You have survived " + days_survived + " days in the arena and emerged as the champion."
}
~ return ""

=== process_action ===
~ risk_factor = (nearby_enemies * 20) + (detection_risk * 10) + (player_injuries * 5) + (noise_level * 3)
~ success_chance = 100 - risk_factor
{success_chance < 0: success_chance = 0}

{nearby_enemies > 0:
    ~ combat_advantage = (player_strength * 2) + (player_stealth * 3) - (enemy_strength * 2) - (enemy_distance / 10)
    {combat_advantage < 0:
        ~ combat_advantage = 0
    }
}

{action_input != "":
    - "water" or "river" or "stream" or "lake":
        -> calculate_water_outcome
    - "run" or "sprint" or "dash":
        ~ movement_type = "run"
        -> calculate_movement_outcome
    - "jump" or "leap" or "climb":
        ~ movement_type = "jump"
        -> calculate_movement_outcome
    - "walk" or "move" or "go":
        ~ movement_type = "walk"
        -> calculate_movement_outcome
    - "rest" or "sleep" or "sit":
        -> calculate_rest_outcome
    - "build" or "make" or "create":
        -> calculate_build_outcome
    - "search" or "look" or "explore":
        -> calculate_search_outcome
    - "hide" or "sneak" or "stealth":
        -> calculate_stealth_outcome
    - "attack" or "fight" or "kill":
        -> calculate_combat_outcome
    - "eat" or "food" or "drink":
        -> calculate_food_outcome
    - else:
        -> calculate_generic_outcome
}
-> free_roam_loop

=== calculate_water_outcome ===
~ water_risk = 0
{weather == "stormy":
    ~ water_risk += 20
}
{terrain_type == "swamp":
    ~ water_risk += 30
}
{nearby_enemies > 0:
    ~ water_risk += 25
}
{player_knowledge < 3:
    ~ water_risk += 15
}

{
- RANDOM(1,100) <= water_risk:
    ~ action_result = "You " + action_input + " and find water, but it's contaminated. You drink anyway and immediately feel sick. Your health plummets as your body fights the infection."
    ~ player_health -= RANDOM(15,25)
    ~ player_injuries += 1
    ~ player_morale -= 10
- RANDOM(1,100) <= 30:
    ~ action_result = "You " + action_input + " and discover a clear, fresh water source. You drink deeply and feel completely refreshed. Your thirst is quenched and your energy restored."
    ~ player_thirst = 0
    ~ player_energy += 20
    ~ player_health += 5
    ~ player_morale += 5
- RANDOM(1,100) <= 50:
    ~ action_result = "You " + action_input + " and find a small stream. The water looks safe enough, and you drink what you need. You feel better, though still somewhat thirsty."
    ~ player_thirst -= 20
    ~ player_energy += 10
- else:
    ~ action_result = "You " + action_input + " and locate a muddy puddle. The water is barely drinkable, but it's better than nothing. You take small sips, trying to avoid getting sick."
    ~ player_thirst -= 10
    ~ player_energy += 5
}
-> free_roam_loop

=== calculate_movement_outcome ===
~ movement_risk = 0
{action_input != "":
    - "run" or "sprint" or "dash":
        ~ movement_type = "run"
    - "jump" or "leap" or "climb":
        ~ movement_type = "jump"
    - "walk" or "move" or "go":
        ~ movement_type = "walk"
}

{player_injuries > 2:
    ~ movement_risk += 30
}
{player_energy < 30:
    ~ movement_risk += 20
}
{terrain_type == "mountain":
    ~ movement_risk += 15
}
{weather == "stormy":
    ~ movement_risk += 25
}
{visibility < 50:
    ~ movement_risk += 20
}
{nearby_enemies > 0:
    ~ movement_risk += 35
}
{movement_type == "run":
    ~ movement_risk += 15
}
{movement_type == "jump":
    ~ movement_risk += 25
}

{
- RANDOM(1,100) <= movement_risk and movement_type == "run":
    ~ action_result = "You " + action_input + " and immediately regret it. Your injured leg gives out, and you crash into the ground. The impact is brutal, and you hear something crack. You're in serious pain."
    ~ player_health -= RANDOM(20,35)
    ~ player_injuries += 2
    ~ player_energy -= 15
    ~ player_morale -= 15
- RANDOM(1,100) <= movement_risk and movement_type == "jump":
    ~ action_result = "You " + action_input + " and misjudge the distance completely. You land hard on jagged rocks, cutting yourself badly. Blood seeps from multiple wounds."
    ~ player_health -= RANDOM(25,40)
    ~ player_injuries += 3
    ~ player_energy -= 20
    ~ player_morale -= 20
- RANDOM(1,100) <= movement_risk:
    ~ action_result = "You " + action_input + " and trip over an unseen obstacle. You fall hard, scraping your hands and knees. The pain is sharp and immediate."
    ~ player_health -= RANDOM(10,20)
    ~ player_injuries += 1
    ~ player_energy -= 10
    ~ player_morale -= 5
- RANDOM(1,100) <= 40 and movement_type == "run":
    ~ action_result = "You " + action_input + " with surprising speed and agility. Your training pays off as you cover ground quickly and efficiently. You feel energized by the movement."
    ~ player_energy += 10
    ~ player_morale += 5
    ~ escape_chance += 20
- RANDOM(1,100) <= 40 and movement_type == "jump":
    ~ action_result = "You " + action_input + " with perfect form. Your leap is graceful and controlled, landing you exactly where you intended. The movement feels natural and powerful."
    ~ player_energy += 5
    ~ player_morale += 10
    ~ player_stealth += 1
- RANDOM(1,100) <= 40:
    ~ action_result = "You " + action_input + " carefully and deliberately. Your movements are steady and controlled, conserving energy while making good progress."
    ~ player_energy += 5
    ~ player_morale += 3
- else:
    ~ action_result = "You " + action_input + " and make steady progress. The movement is uneventful but effective. You're making your way through the arena as planned."
    ~ player_energy -= 2
}
-> free_roam_loop

=== calculate_rest_outcome ===
~ rest_risk = 0
{nearby_enemies > 0:
    ~ rest_risk += 40
}
{enemy_distance < 30:
    ~ rest_risk += 30
}
{enemy_aware:
    ~ rest_risk += 25
}
{player_stealth < 3:
    ~ rest_risk += 15
}
{terrain_type == "desert":
    ~ rest_risk += 10
}

{
- RANDOM(1,100) <= rest_risk:
    ~ action_result = "You " + action_input + " and immediately hear footsteps approaching. You scramble to your feet just as a tribute appears from the bushes. They're armed and look aggressive. You're in immediate danger!"
    ~ nearby_enemies = 1
    ~ enemy_distance = 5
    ~ enemy_aggressive = true
    ~ enemy_aware = true
    ~ player_energy -= 10
    ~ player_morale -= 20
    ~ detection_risk += 30
- RANDOM(1,100) <= 60:
    ~ action_result = "You " + action_input + " in a well-hidden spot. The rest is peaceful and restorative. You feel your energy returning and your mind clearing. This was exactly what you needed."
    ~ player_energy += 30
    ~ player_health += 5
    ~ player_morale += 15
    ~ player_hunger -= 5
    ~ player_thirst -= 5
- else:
    ~ action_result = "You " + action_input + " briefly, but you're too tense to relax properly. Every sound makes you jump. Still, you manage to recover some energy."
    ~ player_energy += 15
    ~ player_morale += 5
}
-> free_roam_loop

=== calculate_build_outcome ===
~ build_risk = 0
{nearby_enemies > 0:
    ~ build_risk += 35
}
{player_knowledge < 2:
    ~ build_risk += 20
}
{player_energy < 30:
    ~ build_risk += 15
}
{weather == "stormy":
    ~ build_risk += 25
}

{
- RANDOM(1,100) <= build_risk:
    ~ action_result = "You " + action_input + " but your lack of experience shows. The structure collapses on you, causing injuries. You're lucky it wasn't worse."
    ~ player_health -= RANDOM(15,25)
    ~ player_injuries += 1
    ~ player_energy -= 20
    ~ player_morale -= 10
- RANDOM(1,100) <= 50:
    ~ action_result = "You " + action_input + " with skill and patience. The result is impressive - a sturdy shelter that provides excellent cover and protection. You feel proud of your work."
    ~ shelter_quality += 20
    ~ player_energy -= 10
    ~ player_morale += 15
    ~ detection_risk -= 10
- else:
    ~ action_result = "You " + action_input + " a basic structure. It's not perfect, but it provides some shelter and cover. It's better than nothing."
    ~ shelter_quality += 10
    ~ player_energy -= 5
    ~ player_morale += 5
}
-> free_roam_loop

=== calculate_search_outcome ===
~ search_risk = 0
{nearby_enemies > 0:
    ~ search_risk += 30
}
{enemy_aware:
    ~ search_risk += 25
}
{player_stealth < 2:
    ~ search_risk += 15
}
{noise_level > 5:
    ~ search_risk += 20
}

{
- RANDOM(1,100) <= search_risk:
    ~ action_result = "You " + action_input + " and immediately regret it. You've made too much noise, and you hear movement nearby. Someone is coming to investigate. You need to move quickly!"
    ~ nearby_enemies = 1
    ~ enemy_distance = 15
    ~ enemy_aware = true
    ~ detection_risk += 25
    ~ player_energy -= 5
    ~ player_morale -= 10
- RANDOM(1,100) <= 40:
    ~ action_result = "You " + action_input + " carefully and discover something valuable! You find a cache of supplies - food, water, and even some medical supplies. This is a major find!"
    ~ food_available += 20
    ~ water_available += 15
    ~ player_morale += 20
    ~ resource_abundance += 15
- RANDOM(1,100) <= 70:
    ~ action_result = "You " + action_input + " thoroughly and find some useful items. There's a bit of food and some materials you can use. Not a huge find, but helpful."
    ~ food_available += 5
    ~ water_available += 5
    ~ player_morale += 5
    ~ resource_abundance += 5
- else:
    ~ action_result = "You " + action_input + " but find nothing of value. The area has been picked clean by other tributes. You've wasted time and energy."
    ~ player_energy -= 5
    ~ player_morale -= 5
}
-> free_roam_loop

=== calculate_stealth_outcome ===
~ stealth_risk = 0
{player_stealth < 2:
    ~ stealth_risk += 30
}
{player_injuries > 1:
    ~ stealth_risk += 20
}
{terrain_type == "desert":
    ~ stealth_risk += 25
}
{weather == "stormy":
    ~ stealth_risk += 15
}
{nearby_enemies > 0:
    ~ stealth_risk += 40
}

{
- RANDOM(1,100) <= stealth_risk:
    ~ action_result = "You " + action_input + " but you're not very good at it. You make too much noise and attract attention. You hear someone approaching - you've been spotted!"
    ~ nearby_enemies = 1
    ~ enemy_distance = 10
    ~ enemy_aware = true
    ~ detection_risk += 40
    ~ player_energy -= 10
    ~ player_morale -= 15
- RANDOM(1,100) <= 60:
    ~ action_result = "You " + action_input + " with expert precision. Your movements are silent and calculated. You manage to observe other tributes without being detected. Your stealth training is paying off."
    ~ player_stealth += 1
    ~ player_energy -= 5
    ~ player_morale += 10
    ~ detection_risk -= 20
    ~ escape_chance += 15
- else:
    ~ action_result = "You " + action_input + " as best you can. You're not completely silent, but you manage to avoid detection. The movement is slow but effective."
    ~ player_energy -= 3
    ~ player_morale += 3
    ~ detection_risk -= 5
}
-> free_roam_loop

=== calculate_combat_outcome ===
~ combat_risk = 0
{nearby_enemies == 0:
    ~ combat_risk = 100
}
{player_strength < 3:
    ~ combat_risk += 30
}
{player_health < 50:
    ~ combat_risk += 25
}
{enemy_strength > player_strength:
    ~ combat_risk += 40
}
{enemy_distance > 20:
    ~ combat_risk += 50
}

{
- RANDOM(1,100) <= combat_risk and nearby_enemies == 0:
    ~ action_result = "You " + action_input + " but there's no one to fight. You practice your combat stance and feel more confident with your weapon. At least you're prepared for when danger comes."
    ~ player_strength += 1
    ~ player_energy -= 5
    ~ player_morale += 5
- RANDOM(1,100) <= combat_risk:
    ~ action_result = "You " + action_input + " and immediately realize you've made a terrible mistake. The enemy is stronger than you expected, and you're quickly overwhelmed. The fight is brutal and one-sided."
    ~ player_health -= RANDOM(30,50)
    ~ player_injuries += 3
    ~ player_energy -= 25
    ~ player_morale -= 30
    ~ enemy_health -= RANDOM(5,15)
- RANDOM(1,100) <= 40:
    ~ action_result = "You " + action_input + " with skill and determination. The combat is intense, but you hold your own. You manage to drive off your opponent and escape with your life."
    ~ player_health -= RANDOM(10,20)
    ~ player_energy -= 15
    ~ player_morale += 10
    ~ player_strength += 1
    ~ nearby_enemies = 0
    ~ enemy_distance = 100
- else:
    ~ action_result = "You " + action_input + " but the enemy is too strong. You're forced to retreat, taking damage in the process. You need to find a better strategy."
    ~ player_health -= RANDOM(15,25)
    ~ player_energy -= 10
    ~ player_morale -= 10
    ~ escape_chance -= 10
}
-> free_roam_loop

=== calculate_food_outcome ===
~ food_risk = 0
{player_knowledge < 2:
    ~ food_risk += 30
}
{food_available < 5:
    ~ food_risk += 20
}
{terrain_type == "desert":
    ~ food_risk += 25
}
{weather == "stormy":
    ~ food_risk += 15
}

{
- RANDOM(1,100) <= food_risk:
    ~ action_result = "You " + action_input + " something that looks edible, but it's actually poisonous. Within minutes, you're violently ill. Your body fights the poison, but you're severely weakened."
    ~ player_health -= RANDOM(25,40)
    ~ player_injuries += 2
    ~ player_energy -= 20
    ~ player_morale -= 20
    ~ player_hunger += 10
- RANDOM(1,100) <= 50:
    ~ action_result = "You " + action_input + " and find a feast! There's plenty of safe, nutritious food. You eat your fill and feel completely satisfied. Your energy and morale are restored."
    ~ player_hunger = 0
    ~ player_energy += 25
    ~ player_health += 10
    ~ player_morale += 15
    ~ food_available -= 10
- else:
    ~ action_result = "You " + action_input + " what little food you can find. It's not much, but it takes the edge off your hunger. You feel slightly better."
    ~ player_hunger -= 15
    ~ player_energy += 10
    ~ player_morale += 5
    ~ food_available -= 5
}
-> free_roam_loop

=== calculate_generic_outcome ===
~ generic_risk = 0
{nearby_enemies > 0:
    ~ generic_risk += 25
}
{player_energy < 20:
    ~ generic_risk += 15
}
{player_health < 30:
    ~ generic_risk += 20
}

{
- RANDOM(1,100) <= generic_risk:
    ~ action_result = "You " + action_input + " but your weakened state makes it difficult. You struggle with the action and end up hurting yourself. This is getting harder."
    ~ player_health -= RANDOM(5,15)
    ~ player_energy -= 10
    ~ player_morale -= 10
- RANDOM(1,100) <= 60:
    ~ action_result = "You " + action_input + " successfully. The action feels natural and you accomplish what you set out to do. You're getting better at surviving in this arena."
    ~ player_energy -= 3
    ~ player_morale += 5
    ~ player_strength += 1
- else:
    ~ action_result = "You " + action_input + " and manage to complete the action, though it takes more effort than expected. You're making progress, slowly but surely."
    ~ player_energy -= 5
    ~ player_morale += 2
}
-> free_roam_loop
