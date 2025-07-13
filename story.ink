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

The arena stretches before you. You can do anything you want to survive. Type your actions in the input box below.

* [Continue your journey]
    -> free_roam

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
