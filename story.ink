EXTERNAL get_name()

=== function get_name ===
~ return "Anonymous"

-> intro

=== intro ===
Welcome to Panem. The Capitol watches. The Districts remember.

Before we begin, let's get to know you.

Hello {get_name()}!

-> ask_age

=== ask_age ===
How old are you?

* I'm 12 years old
    -> ask_district
* I'm 13 years old
    -> ask_district
* I'm 14 years old
    -> ask_district
* I'm 15 years old
    -> ask_district
* I'm 16 years old
    -> ask_district
* I'm 17 years old
    -> ask_district
* I'm 18 years old
    -> ask_district

=== ask_district ===
Which district are you from?

* District 1 - Luxury Items
    -> reaping_intro
* District 2 - Masonry & Defense
    -> reaping_intro
* District 3 - Technology
    -> reaping_intro
* District 4 - Fishing
    -> reaping_intro
* District 5 - Power
    -> reaping_intro
* District 6 - Transportation
    -> reaping_intro
* District 7 - Lumber
    -> reaping_intro
* District 8 - Textiles
    -> reaping_intro
* District 9 - Grain
    -> reaping_intro
* District 10 - Livestock
    -> reaping_intro
* District 11 - Agriculture
    -> reaping_intro
* District 12 - Coal Mining
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
    -> training_start
* Pick throwing knives
    Your mentor produces a set of finely crafted throwing knives. "These are balanced perfectly," she explains. "They're small enough to hide, but deadly in the right hands. Practice with them every chance you get." You test the weight of one in your hand - it feels natural, like an extension of your arm.
    -> training_start
* Pick a rope & trap kit
    Your mentor gives you a bundle containing rope, wire, and various small tools. "This is for setting traps and moving quietly," she says. "The rope can be used for climbing, binding, or even as a weapon. The wire is perfect for snares." You nod, understanding the value of stealth in the arena.
    -> training_start

=== training_start ===
You enter the Capitol training center.

-> train_day_1

=== train_day_1 ===
Day 1 of training. Choose your activity:

* Practice with a spear
    You spend hours practicing with the spear, learning its balance and reach. The weapon feels powerful in your hands, and you quickly develop a rhythm. Your instructor shows you proper throwing techniques and close combat moves. By the end of the day, your arms are sore but you feel more confident with your chosen weapon.
    -> train_day_2
* Study edible plants
    You spend the day with a botanist, learning to identify edible plants, berries, and roots. You memorize the distinctive features of safe plants and the warning signs of poisonous ones. "This knowledge could keep you alive longer than any weapon," the botanist tells you. You carefully sketch the plants in your mind, determined to remember every detail.
    -> train_day_2
* Observe other tributes
    You spend the day watching the other tributes train, studying their strengths and weaknesses. You notice patterns in their movements, their preferred weapons, and how they interact with each other. Some form alliances, others work alone. You file away every detail, knowing this information could be crucial in the arena.
    -> train_day_2

=== train_day_2 ===
Day 2 of training. Choose again:

* Climb ropes and trees
    You spend the day climbing ropes, scaling walls, and practicing tree climbing techniques. Your instructor teaches you how to move silently through branches and how to use height to your advantage. "In the arena, the high ground can mean the difference between life and death," she says. You practice until your hands are calloused and your movements become fluid.
    -> interview
* Learn to set traps
    You learn various trap-making techniques - snares, deadfalls, and pit traps. Your instructor shows you how to camouflage them and where to place them strategically. "Traps can eliminate threats without direct confrontation," he explains. You practice setting and disarming traps until you can do it quickly and quietly.
    -> interview
* Hand-to-hand combat
    You spend hours learning hand-to-hand combat techniques - punches, kicks, blocks, and throws. Your instructor emphasizes efficiency and using your opponent's strength against them. "In the arena, you'll need to fight dirty to survive," he says. You practice until your muscles ache and your reflexes become sharper.
    -> interview

=== interview ===
Your private interview with the Gamemakers begins.

What is your weapon specialty?

* Spear fighting
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Archery
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Knife throwing
    They assign you a training score you hope will win sponsors…
    -> training_score_scene
* Hand-to-hand combat
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
    -> END

=== cornucopia_choice ===
The horn sounds.

* Run for the Cornucopia to grab supplies
    The horn blares and chaos erupts. You sprint toward the Cornucopia, dodging between other tributes. You see several fights break out around you as tributes battle for the best supplies. You manage to grab a backpack and quickly retreat, avoiding the bloodbath. Inside the backpack, you find bread, a knife, and a water bottle. Not much, but it's a start.
    -> arena_intro
* Sprint into the woods
    The horn sounds and you immediately turn and run toward the forest. Behind you, you hear screams and the sounds of fighting as tributes battle over the supplies at the Cornucopia. You don't look back, focusing only on putting distance between yourself and the bloodbath. The trees provide cover as you disappear into the wilderness.
    -> arena_intro

=== arena_intro ===
You are now inside the arena. The Games have begun.

-> free_roam

=== free_roam ===
You are in the arena. What do you want to do?

* Search for water
    You find a muddy stream. It's risky but drinkable.
    -> free_roam
* Hide in the brush
    You crawl under thick brush, heart pounding.
    -> free_roam
* Attack a nearby tribute
    You lunge at a nearby tribute. Blood splashes.
    -> free_roam
* Eat your supplies
    You eat some of your supplies, regaining a bit of strength.
    -> free_roam
* Run to the woods
    You sprint deeper into the woods, putting distance between you and danger.
    -> free_roam
* Ask for sponsor gift
    A silver parachute drifts down from the sky! Inside you find medicine and food.
    -> free_roam
* Build a shelter
    You construct a crude shelter from branches and leaves.
    -> free_roam
* Set a trap
    You carefully set up a snare trap.
    -> free_roam
* Hunt for food
    You track and catch a small animal.
    -> free_roam
* Climb a tree
    You scale a tall tree for a better vantage point.
    -> free_roam
