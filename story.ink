-> intro

VAR health     = 100
VAR stamina    = 100
VAR hunger     = 0
VAR strength   = 0
VAR knowledge  = 0
VAR awareness  = 0
VAR agility    = 0
VAR stealth    = 0
VAR idle       = 0

VAR name       = ""
VAR age        = 0
VAR district   = ""
VAR weapon     = ""
VAR inventory  = ""
VAR specialty  = ""
VAR gpt_response = ""
VAR sponsor_points = 0
VAR training_score = 0

=== intro ===
Welcome to Panem. The Capitol watches. The Districts remember.

Before we begin, let's get to know you.

What is your name?
* My name is Katniss
    ~ name = "Katniss"
    -> ask_age
* My name is Peeta
    ~ name = "Peeta"
    -> ask_age
* My name is Gale
    ~ name = "Gale"
    -> ask_age
* My name is Prim
    ~ name = "Prim"
    -> ask_age

=== ask_age ===
How old are you?
* I'm 16 years old
    ~ age = 16
    -> ask_district
* I'm 17 years old
    ~ age = 17
    -> ask_district
* I'm 15 years old
    ~ age = 15
    -> ask_district
* I'm 14 years old
    ~ age = 14
    -> ask_district

=== ask_district ===
Which district are you from?
* District 12 - Coal mining
    ~ district = "12"
    Your name is {name}, age {age}, from District {district}.
    -> reaping_intro
* District 11 - Agriculture
    ~ district = "11"
    Your name is {name}, age {age}, from District {district}.
    -> reaping_intro
* District 7 - Lumber
    ~ district = "7"
    Your name is {name}, age {age}, from District {district}.
    -> reaping_intro
* District 4 - Fishing
    ~ district = "4"
    Your name is {name}, age {age}, from District {district}.
    -> reaping_intro

=== reaping_intro ===
The Reaping Day begins. Crowds form. Tension rises.

You hear your name called…  
Your world collapses in a moment. You are the chosen tribute.

-> mentor_scene

=== mentor_scene ===
Your mentor pulls you into a dark corner.

* Pick a med-kit  
    ~ health += 20
    ~ sponsor_points += 15
    Your mentor hands you a small medical kit. "This could save your life," she whispers. "It contains bandages, antiseptic, and painkillers. Use it wisely." You carefully tuck it into your pocket, feeling a bit more prepared for what lies ahead.
    -> training_start
* Pick throwing knives  
    ~ weapon = "knives"
    ~ sponsor_points += 25
    Your mentor produces a set of finely crafted throwing knives. "These are balanced perfectly," she explains. "They're small enough to hide, but deadly in the right hands. Practice with them every chance you get." You test the weight of one in your hand - it feels natural, like an extension of your arm.
    -> training_start
* Pick a rope & trap kit  
    ~ stealth += 10
    ~ sponsor_points += 20
    Your mentor gives you a bundle containing rope, wire, and various small tools. "This is for setting traps and moving quietly," she says. "The rope can be used for climbing, binding, or even as a weapon. The wire is perfect for snares." You nod, understanding the value of stealth in the arena.
    -> training_start

=== training_start ===
You enter the Capitol training center.
-> train_day_1

=== train_day_1 ===
Day 1 of training. Choose your activity:

* Practice with a spear  
    ~ weapon = "spear"  
    ~ strength += 10
    ~ sponsor_points += 20
    You spend hours practicing with the spear, learning its balance and reach. The weapon feels powerful in your hands, and you quickly develop a rhythm. Your instructor shows you proper throwing techniques and close combat moves. By the end of the day, your arms are sore but you feel more confident with your chosen weapon.
    -> train_day_2
* Study edible plants  
    ~ knowledge += 10
    ~ sponsor_points += 15
    You spend the day with a botanist, learning to identify edible plants, berries, and roots. You memorize the distinctive features of safe plants and the warning signs of poisonous ones. "This knowledge could keep you alive longer than any weapon," the botanist tells you. You carefully sketch the plants in your mind, determined to remember every detail.
    -> train_day_2
* Observe other tributes  
    ~ awareness += 10
    ~ sponsor_points += 30
    You spend the day watching the other tributes train, studying their strengths and weaknesses. You notice patterns in their movements, their preferred weapons, and how they interact with each other. Some form alliances, others work alone. You file away every detail, knowing this information could be crucial in the arena.
    -> train_day_2

=== train_day_2 ===
Day 2 of training. Choose again:

* Climb ropes and trees  
    ~ agility += 10
    ~ sponsor_points += 25
    You spend the day climbing ropes, scaling walls, and practicing tree climbing techniques. Your instructor teaches you how to move silently through branches and how to use height to your advantage. "In the arena, the high ground can mean the difference between life and death," she says. You practice until your hands are calloused and your movements become fluid.
    -> interview
* Learn to set traps  
    ~ stealth += 10
    ~ sponsor_points += 20
    You learn various trap-making techniques - snares, deadfalls, and pit traps. Your instructor shows you how to camouflage them and where to place them strategically. "Traps can eliminate threats without direct confrontation," he explains. You practice setting and disarming traps until you can do it quickly and quietly.
    -> interview
* Hand-to-hand combat  
    ~ strength += 10
    ~ sponsor_points += 15
    You spend hours learning hand-to-hand combat techniques - punches, kicks, blocks, and throws. Your instructor emphasizes efficiency and using your opponent's strength against them. "In the arena, you'll need to fight dirty to survive," he says. You practice until your muscles ache and your reflexes become sharper.
    -> interview

=== interview ===
Your private interview with the Gamemakers begins.

What is your weapon specialty?
* Spear fighting
    ~ specialty = "spear"
    ~ sponsor_points += 20
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Archery
    ~ specialty = "archery"
    ~ sponsor_points += 25
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Knife throwing
    ~ specialty = "knives"
    ~ sponsor_points += 15
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Hand-to-hand combat
    ~ specialty = "combat"
    ~ sponsor_points += 10
    They assign you a training score you hope will win sponsors…
    -> training_score_scene

=== training_score_scene ===
The Gamemakers confer in hushed tones. Your heart pounds as you wait for your score.

~ training_score = strength + knowledge + awareness + agility + stealth + (sponsor_points / 10)

Your training score is: {training_score}

- if (training_score >= 80)
    The crowd erupts in applause! You've earned an exceptional score that will surely attract wealthy sponsors.
- else if (training_score >= 60)
    The audience murmurs appreciatively. A solid score that should draw some sponsor interest.
- else if (training_score >= 40)
    The reaction is mixed. Your score is adequate, but you'll need to work harder to impress sponsors.
- else
    The silence is deafening. Your low score will make it difficult to attract sponsors.

* Continue to the platform
    -> platform_start

=== platform_start ===
You stand on the tribute platform. 60 seconds until start.

* Stay still and wait  
    -> cornucopia_choice
* Step off the platform  
    You stepped off early and triggered a land-mine. You are dead.  
    -> END

=== cornucopia_choice ===
The horn sounds.

* Run for the Cornucopia to grab supplies
    The horn blares and chaos erupts. You sprint toward the Cornucopia, dodging between other tributes. You see several fights break out around you as tributes battle for the best supplies. You manage to grab a backpack and quickly retreat, avoiding the bloodbath. Inside the backpack, you find bread, a knife, and a water bottle. Not much, but it's a start.
    ~ inventory = "knife, bread, water"
    -> arena_intro
* Sprint into the woods
    The horn sounds and you immediately turn and run toward the forest. Behind you, you hear screams and the sounds of fighting as tributes battle over the supplies at the Cornucopia. You don't look back, focusing only on putting distance between yourself and the bloodbath. The trees provide cover as you disappear into the wilderness.
    -> arena_intro

=== arena_intro ===
You are now inside the arena. The Games have begun.
-> free_roam

=== free_roam ===
You pause for a moment, considering your next move.
-> process_action

=== process_action ===
- if (action == "search water")
    You find a muddy stream. It's risky but drinkable.
    ~ sponsor_points += 5
    -> free_roam
- else if (action == "hide")
    You crawl under thick brush, heart pounding.
    ~ sponsor_points += 3
    -> free_roam
- else if (action == "attack")
    You lunge at a nearby tribute. Blood splashes.
    ~ sponsor_points += 10
    -> free_roam
- else if (action == "eat")
    You eat some of your supplies, regaining a bit of strength.
    ~ sponsor_points += 2
    -> free_roam
- else if (action == "run to the woods")
    You sprint deeper into the woods, putting distance between you and danger.
    ~ sponsor_points += 5
    -> free_roam
- else if (action == "ask for sponsor gift")
    - if (sponsor_points >= 50)
        A silver parachute drifts down from the sky! Inside you find medicine and food.
        ~ health += 15
        ~ sponsor_points -= 20
    - else if (sponsor_points >= 30)
        A small package lands nearby. It contains a bandage and some bread.
        ~ health += 5
        ~ sponsor_points -= 10
    - else
        You call out to the sponsors, but no response comes. You need to earn more favor first.
    -> free_roam
- else if (action == "build shelter")
    You construct a crude shelter from branches and leaves.
    ~ sponsor_points += 8
    -> free_roam
- else if (action == "set trap")
    You carefully set up a snare trap.
    ~ sponsor_points += 12
    -> free_roam
- else if (action == "hunt")
    You track and catch a small animal.
    ~ sponsor_points += 15
    -> free_roam
- else if (action == "climb tree")
    You scale a tall tree for a better vantage point.
    ~ sponsor_points += 7
    -> free_roam
- else
    {gpt_response}
    ~ sponsor_points += 3
    -> free_roam
