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

=== intro ===
Welcome to Panem. The Capitol watches. The Districts remember.

Before we begin, let's get to know you.

What is your name?
~ name = "Test"

-> ask_age

=== ask_age ===
How old are you?
~ age = 16
{ age >= 18:
    I'm sorry, only those under 18 are eligible. Try again.
    -> intro
- else:
    -> ask_district
}

=== ask_district ===
Which district are you from? (1 – 12)
~ district = "7"
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
* Pick throwing knives  
    ~ weapon = "knives"
* Pick a rope & trap kit  
    ~ stealth += 10

-> training_start

=== training_start ===
You enter the Capitol training center.
-> train_day_1

=== train_day_1 ===
Day 1 of training. Choose your activity:

* Practice with a spear  
    ~ weapon = "spear"  
    ~ strength += 10
* Study edible plants  
    ~ knowledge += 10
* Observe other tributes  
    ~ awareness += 10
-> train_day_2

=== train_day_2 ===
Day 2 of training. Choose again:

* Climb ropes and trees  
    ~ agility += 10
* Learn to set traps  
    ~ stealth += 10
* Hand-to-hand combat  
    ~ strength += 10
-> interview

=== interview ===
Your private interview with the Gamemakers begins.

What is your weapon specialty?  
~ specialty = "spear"

They assign you a training score you hope will win sponsors…

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
    You dodge attacks and grab a backpack. Inside: bread, knife, water.  
    ~ inventory = "knife, bread, water"
* Sprint into the woods  
    You flee into the trees, avoiding the bloodbath.

-> arena_intro

=== arena_intro ===
You are now inside the arena. The Games have begun.
-> free_roam

=== free_roam ===
~ temp cmd = bridge_prompt()

* {cmd == "search water"} You find a muddy stream. It's risky but drinkable.
* {cmd == "hide"} You crawl under thick brush, heart pounding.
* {cmd == "attack"} You lunge at a nearby tribute. Blood splashes.
* {cmd == "rest"} You rest for a few hours. Someone is watching…
* {cmd == "talk"} You whisper to a nearby tribute. Maybe they’ll be your ally.
* {true} I… don’t understand that action.  
    ~ idle += 1

-> free_roam
