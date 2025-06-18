
=== intro ===
Welcome to Panem. The Capitol watches. The Districts remember. 

Before we begin, let's get to know you.

What is your name?
~ name = prompt()
-> ask_age

=== ask_age ===
How old are you?
~ age = parseInt(prompt())
{ age >= 18:
  I'm sorry, only those under 18 are eligible. Try again.
  -> intro
- else:
  -> ask_district
}

=== ask_district ===
Which district are you from? (1 - 12)
~ district = prompt()
Your name is {name}, age {age}, from District {district}.
-> reaping_intro

=== reaping_intro ===
The Reaping Day begins. Crowds form. Tension rises.

You hear your name called...

Your world collapses in a moment. You are the chosen tribute.

-> mentor_scene

=== mentor_scene ===
Your mentor pulls you into a dark corner.

"You’ll have to choose what goes in your supplies. Choose wisely."

* Pick a medkit
  ~ health += 20
* Pick throwing knives
  ~ weapon = "knives"
* Pick a rope and trap kit
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
* Practice hand-to-hand combat
  ~ strength += 10
-> interview

=== interview ===
Your interview with the Gamemakers begins.

What is your weapon specialty?
~ specialty = prompt()

They assign you a training score. You hope it helps with sponsors...

-> platform_start

=== platform_start ===
You stand on the tribute platform. 60 seconds until start.

* Stay still and wait
  -> cornucopia_choice
* Step off the platform
  You stepped off early and triggered a landmine. You are dead.
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

{ cmd == "search water":
    You find a muddy stream. It's risky but drinkable.
- else if cmd == "hide":
    You crawl under thick brush, heart pounding.
- else if cmd == "attack":
    You lunge at a nearby tribute. Blood splashes.
- else if cmd == "rest":
    You rest for a few hours. Someone is watching...
- else if cmd == "talk":
    You whisper to a nearby tribute. Maybe they’ll be your ally.
- else:
    I... don’t understand that action.
    ~ idle += 1
}

-> free_roam
